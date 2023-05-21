var ctx = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["losses", "wins"],
    datasets: [
      {
        data: [11, 9],
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)"],
        borderColor: ["rgba(255,99,132,1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1
      }
    ]
  },
  options: {
    legend: {
      display: false
    }
  }
});