import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import {
  SignalRTCService as SignalrRTCService,
  Status,
} from "src/app/services";
import { ActivatedRoute } from "@angular/router";
import { browser } from 'protractor';
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
  public currentExams: { name: string; status: string }[] = [];
  public checkedExams: { name: string; status: string }[] = [];
  public availableExams: string[] = ["WF", "TOPO", "FONDUS"];
  public pdfBlob: Blob;

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
    this.signalrRTCService.onPdf(b64pdf => this.openPdf(b64pdf));
    this.signalrRTCService.onStatus((status) => {
      this.statues.unshift(status);
    });
    this.signalrRTCService.onAvailableCommands((availableCommands) => {
      this.availableCommands = availableCommands;
    });
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
      this.checkedExams = this.checkedExams.filter((exam) => exam.name !== examName);
      return;
    }
    this.checkedExams.push({ name: examName, status: "PENDING_EXAM" });
  }

  public checkedBox(exam: string): boolean {
    return this.checkedExams.map((e) => e.name).includes(exam);
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

  private openPdf(b64Pdf: string): void {
    const blob = new Blob([atob(b64Pdf)], { type: "data:application/pdf" });
    const localURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = localURL;
    link.download = "sample.pdf"; 
    link.click();
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
    this.statues = [];
    this.currentExams = [...this.checkedExams];
    await this.signalrRTCService.execute(commandName, {
      exams: this.currentExams.map((exam) => exam.name),
    });
    this.isLoading = false;
  }
}
