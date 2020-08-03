import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import {
  SignalRTCService as SignalrRTCService,
  Status,
} from "src/app/services";
import { ActivatedRoute } from "@angular/router";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  public itemName: string;
  public itemPrice: number;
  public authToken: string;
  public availableCommands: string[];
  public statues: Status[] = [];
  public isLoading = false;
  public canvas: HTMLCanvasElement;
  public exams: { name: string; status: string }[] = [];
  public availableExams: string[] = [];
  @ViewChild("logs", { static: false }) public logsContainer: ElementRef;
  constructor(
    private signalrRTCService: SignalrRTCService,
    private activatedRoute: ActivatedRoute
  ) {
    this.authToken = this.activatedRoute.snapshot.queryParams.authToken;
    this.startRtcConnection(this.authToken);
  }

  public ngOnInit(): void {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
  }

  public async startRtcConnection(authToken: string): Promise<void> {
    const deviceServerUrl = JSON.parse(localStorage.getItem("credentials"))
      .deviceServerUrl;
    await this.signalrRTCService.startConnection(deviceServerUrl, authToken);
    const canvas: HTMLCanvasElement = document.getElementById(
      "canvas"
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    this.signalrRTCService.onImage((base64Img) => {
      this.drawImage(ctx, base64Img);
    });
    this.signalrRTCService.onStatus((status) => {
      this.filterStatus(status);
    });
    this.signalrRTCService.onAvailableCommands((availableCommands) => {
      this.availableCommands = availableCommands;
      if (!availableCommands.includes("ABORT_EXAMS")) {
        this.exams = [];
        this.statues = [];
      }
    });
  }

  private filterStatus(status: Status): void {
    switch (status.name) {
      case "AVAILABLE_EXAMS":
        this.availableExams = status.payload.exams;
        break;
      default:
        this.statues.unshift(status);
    }
  }

  public getStatusExam(examName: string) {
    const statusFound = this.statues.find((s) => s.payload.name === examName);
    if (!statusFound) return;
    switch (statusFound.name) {
      case "STARTING_EXAM":
        return "starting-exam";
      case "RESULT_EXAM":
        return "result-exam";
      case "FAILED_EXAM":
        return "failed-exam";
      case "PENDING_EXAM":
        return "pending-exam";
      default:
        return "";
    }
  }

  public onExamChange(examName: string, checked: boolean): void {
    if (!checked) {
      this.exams = this.exams.filter((exam) => exam.name !== examName);
      return;
    }
    this.exams.push({ name: examName, status: "PENDING_EXAM" });
  }

  private resetExams(): void {
    this.exams = [];
  }

  public checkedBox(exam: string) {
    return this.exams.map((e) => e.name).includes(exam);
  }

  private drawImage(ctx: CanvasRenderingContext2D, base64Img: string): void {
    const img = new Image();
    img.src = "data:image;base64," + base64Img;
    img.onload = () =>
      ctx.drawImage(
        img,
        this.canvas.width / 2 - img.width / 2,
        this.canvas.height / 2 - img.height / 2
      );
  }

  public async execute(commandName: string, argument: string): Promise<void> {
    this.isLoading = true;
    await this.signalrRTCService.execute(
      commandName,
      argument && JSON.parse(argument)
    );
    this.isLoading = false;
  }

  public async executeExams(commandName: string): Promise<void> {
    this.isLoading = true;
    await this.signalrRTCService.execute(commandName, {
      exams: this.exams.map((exam) => exam.name),
    });
    this.isLoading = false;
  }
}
