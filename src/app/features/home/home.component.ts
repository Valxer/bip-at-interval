import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { HomeViewModel } from "./home.viewmodel";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  providers: [HomeViewModel],
  templateUrl: 'home.component.html',
  styleUrl: 'home.component.scss'
})
export class HomeComponent {

  protected readonly vm = inject(HomeViewModel);
  
  protected readonly isPlaying = computed(() => this.vm.state().isPlaying);
  protected readonly intervalTotal = computed(() => this.vm.state().intervalTotal);
  protected readonly timeLeft = computed(() => this.vm.state().secondsRemaining);
  protected readonly volume = computed(() => this.vm.state().volume);
  protected readonly fileName = computed(() => this.vm.state().fileName);
  
  private selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  updateVolume(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.vm.setVolume(parseFloat(value));
  }

  updateInterval(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.vm.setInterval(Number(value));
  }

  stop(): void {
    this.vm.stop();
  }

  start(seconds: string): void {
  const sec = parseFloat(seconds);
  if (sec > 0) {
    this.vm.startLoop(this.selectedFile, sec);
  }
}
}