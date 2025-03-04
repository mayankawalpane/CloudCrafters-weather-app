import { Component } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent {
  city: string = '';
  weather: any = null;
  error: string = '';
  loading: boolean = false;

  constructor(private weatherService: WeatherService) { }

  searchWeather() {
    const trimmedCity = this.city.trim();
    if (!trimmedCity) {
      this.error = 'Please enter a city name';
      return;
    }

    this.loading = true;
    this.weatherService.getWeather(trimmedCity).subscribe({
      next: (data) => {
        this.weather = data;
        this.error = '';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to fetch weather data';
        this.weather = null;
        this.loading = false;
      }
    });
  }

  downloadReport() {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(45, 45, 66);
    doc.text(`${this.weather.location.name} Weather Report`, 15, 20);
    
    // Subheader
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${date} | Location: ${this.weather.location.lat}, ${this.weather.location.lon}`, 15, 27);

    // Weather Data Table
    autoTable(doc, {
      startY: 35,
      head: [['Parameter', 'Value']],
      body: [
        ['Temperature', `${this.weather.current.temp_c}°C / ${this.weather.current.temp_f}°F`],
        ['Condition', this.weather.current.condition.text],
        ['Humidity', `${this.weather.current.humidity}%`],
        ['Wind Speed', `${this.weather.current.wind_kph} km/h`],
        ['Wind Direction', this.weather.current.wind_dir],
        ['Feels Like', `${this.weather.current.feelslike_c}°C / ${this.weather.current.feelslike_f}°F`],
        ['Visibility', `${this.weather.current.vis_km} km`],
        ['UV Index', this.weather.current.uv],
        ['Last Updated', this.weather.current.last_updated]
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [77, 171, 247], textColor: 255 },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Save PDF
    doc.save(`weather-report-${this.weather.location.name}.pdf`);
  }
}