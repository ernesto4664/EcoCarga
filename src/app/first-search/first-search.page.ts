import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-first-search',
  templateUrl: './first-search.page.html',
  styleUrls: ['./first-search.page.scss'],
})
export class FirstSearchPage implements OnInit {
  typeAC: boolean = false;
  typeDC: boolean = false;
  connectors: any[] = [];
  allConnectors: any[] = [];
  showAlert = false;
  alertButtons = [
    {
      text: 'REGRESAR',
      role: 'cancel',
      cssClass: 'secondary',
      handler: () => {
        this.showAlert = false;
      }
    },
    {
      text: 'SIGUIENTE',
      handler: () => {
        this.navigateToSecondSearch();
      }
    }
  ];

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.fetchAllConnectors();
  }

  onCheckboxChange() {
    this.filterConnectors();
  }

  fetchAllConnectors() {
    this.apiService.getConnectors().subscribe(
      (response: any) => {
        console.log('API Response:', response);
        if (response.items && Array.isArray(response.items)) {
          this.allConnectors = response.items;
          console.log('Items:', response.items);
          this.filterConnectors();
        } else {
          console.error('Unexpected API response format:', response);
        }
      },
      error => {
        console.error('Error fetching connectors:', error);
      }
    );
  }

  filterConnectors() {
    console.log('Filtering connectors');
    if (this.typeAC || this.typeDC) {
      this.connectors = this.allConnectors.filter(connector => {
        console.log('Power Type:', connector.power_type);
        return (this.typeAC && connector.power_type === 'AC_1_PHASE') || (this.typeDC && connector.power_type === 'DC');
      });
      console.log('Filtered connectors:', this.connectors);
    } else {
      this.connectors = [];
    }
  }

  confirmSelection() {
    this.showAlert = true;
  }

  onAlertDismiss() {
    this.showAlert = false;
  }

  navigateToSecondSearch() {
    this.router.navigate(['/second-search']);
  }
}
