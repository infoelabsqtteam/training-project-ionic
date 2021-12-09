export const chartdata =   {
    "Reports":  {
        "datasets": [
            {
                label: 'Report 1',
                data: [98, 90, 70, 60, 75, 80],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],                
                hoverBackgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                hoverBorderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
                grouped: true
            },
            {
                label: 'Report 2',
                data: [68, 80, 50,30, 45, 60],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(255,99,132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],                                
                hoverBackgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                hoverBorderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }
        ],
        "type": "bar",
        "label": ['January', 'February', 'March', 'April', 'May', 'June'],
        "option": {
            responsive: true,
            layout: {
                padding: 0
            }
        },
        "legend": true
    },    
    "Report on Pie Chart":  {
        "datasets": [
            {
                label: 'Report Card 1',
                data: [98, 90, 70, 60, 75, 80],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.4)',
                    'rgba(54, 162, 235, 0.4)',
                    'rgba(255, 206, 86, 0.4)',
                    'rgba(75, 192, 192, 0.4)',
                    'rgba(153, 102, 255, 0.4)',
                    'rgba(255, 159, 64, 0.4)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                hoverBackgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }
        ],
        "type": "pie",
        "label": ['February', 'March', 'April', 'May', 'June', 'July'],
        "option": {responsive: true},
        "legend": true
    },
    "Report progress":  {
            "datasets": [
                {
                    label: 'Report Card 1',
                    data: [98, 90, 70, 60, 75, 80],
                    backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Report Card 2',
                    data: [68, 80, 50,30, 45, 60],
                    backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                    ],
                    borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }
            ],
            "type": "line",
            "label": ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            "option": {responsive: true},
            "legend": true
    },
    "Daily Report on Doughnut":  {
        "datasets": [
            {
                label: 'Report Card 2',
                data: [10, 40, 50,30, 45, 20],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.4)',
                    'rgba(54, 162, 235, 0.4)',
                    'rgba(255, 206, 86, 0.4)',
                    'rgba(75, 192, 192, 0.4)',
                    'rgba(153, 102, 255, 0.4)',
                    'rgba(255, 159, 64, 0.4)'
                ],
                borderColor: [
                    'rgba(255,99,132, .6)',
                    'rgba(54, 162, 235, .6)',
                    'rgba(255, 206, 86, .6)',
                    'rgba(75, 192, 192, .6)',
                    'rgba(153, 102, 255, .6)',
                    'rgba(255, 159, 64, .6)'
                ],                
                borderWidth: 1,
                hoverBackgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                hoverBorderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],                
                hoverBorderWidth: 3
            }
        ],
        "type": "doughnut",
        "label": ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        "option": {responsive: true},
        "legend": true
    },
    "Report on Polar Area Chart":  {
        "datasets": [
            {
                label: 'Report Card 2',
                data: [40, 30, 50, 35, 65, 70],
                backgroundColor: [
                'rgb(255, 99, 132, 0.4)',
                'rgb(75, 192, 192, 0.4)',
                'rgb(255, 205, 86, 0.4)',
                'rgb(201, 203, 207, 0.4)',
                'rgb(54, 162, 235, 0.4)',
                'rgba(255, 159, 64, 0.4)'
                ],
                borderColor: [
                'rgb(255, 99, 132, 1)',
                'rgb(75, 192, 192, 1)',
                'rgb(255, 205, 86, 1)',
                'rgb(201, 203, 207, 1)',
                'rgb(54, 162, 235, 1)',
                'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
                hoverBackgroundColor: [
                'rgb(255, 99, 132, .8)',
                'rgb(75, 192, 192, .8)',
                'rgb(255, 205, 86, .8)',
                'rgb(201, 203, 207, .8)',
                'rgb(54, 162, 235, .8)',
                'rgba(255, 159, 64, .8)'
                ],
                hoverBorderColor: [
                'rgb(255, 99, 132, 1)',
                'rgb(75, 192, 192, 1)',
                'rgb(255, 205, 86, 1)',
                'rgb(201, 203, 207, 1)',
                'rgb(54, 162, 235, 1)',
                'rgba(255, 159, 64, 1)'
                ],
                hoverBorderWidth: 2
            }
        ],
        "type": "polarArea",
        "label": ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        "option": {responsive: true},
        "legend": true
    },
    "Mixed Chart Report":  {
        "datasets": [
            {
                type: 'bar',
                label: 'Bar Report 1',
                data: [40, 30, 50, 35, 65, 70],
                backgroundColor: [
                    'rgb(255, 205, 86, 0.4)',
                    'rgb(201, 203, 207, 0.4)',
                    'rgb(54, 162, 235, 0.4)',
                    'rgba(255, 159, 64, 0.4)'
                ],
                borderColor: [
                    'rgb(255, 205, 86, 1)',
                    'rgb(201, 203, 207, 1)',
                    'rgb(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
                hoverBackgroundColor: [
                    'rgb(255, 205, 86, .8)',
                    'rgb(201, 203, 207, .8)',
                    'rgb(54, 162, 235, .8)',
                    'rgba(255, 159, 64, .8)'
                ],
                hoverBorderColor: [
                    'rgb(255, 205, 86, 1)',
                    'rgb(201, 203, 207, 1)',
                    'rgb(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                hoverBorderWidth: 2
            },
            {
                type: 'line',
                label: 'Line Report 1',
                data: [40, 30, 70, 65, 55, 80],
                backgroundColor: [
                    'rgb(255, 205, 86, 0.4)',
                    'rgb(201, 203, 207, 0.4)',
                    'rgb(54, 162, 235, 0.4)',
                    'rgba(255, 159, 64, 0.4)'
                ],
                borderColor: [
                    'rgb(255, 205, 86, 1)',
                    'rgb(201, 203, 207, 1)',
                    'rgb(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
                hoverBackgroundColor: [
                    'rgb(255, 205, 86, .8)',
                    'rgb(201, 203, 207, .8)',
                    'rgb(54, 162, 235, .8)',
                    'rgba(255, 159, 64, .8)'
                ],
                hoverBorderColor: [
                    'rgb(255, 205, 86, 1)',
                    'rgb(201, 203, 207, 1)',
                    'rgb(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                hoverBorderWidth: 2
            }
        ],
        "label": ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        "option": {
            responsive: true
        },
        scales: {
            y: {
              beginAtZero: true
            }
        },
        "legend": true
    }
          
}