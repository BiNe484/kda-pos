function selectTypeOfData(element) {
  // Lấy text của mục được chọn
  const selectedText = element.textContent;
  // Tìm nút dropdown
  const dropdownButton = document.getElementById('dropdownMenuButton');
  // Cập nhật text cho nút dropdown
  dropdownButton.textContent = selectedText;
  // Truy xuất phần tử canvas
  const canvasElement = document.querySelector('canvas');

  // Lấy giá trị id của canvas
  const chartType = canvasElement.id;
  const data = element.getAttribute('data-type')
  if(chartType == "barChart"){
    updateBarChart(currentButton, data);
  } else if (chartType == "lineChart"){
    updateLineChart(currentButton, data);
  } else{
    updateMultiChart(currentButton);
  }
}
let myBarChart = null; // Biến toàn cục để lưu trữ biểu đồ hiện tại
async function updateBarChart(button, inputData) {
  var barChartElement = document.getElementById("barChart").getContext("2d");
  // Nếu biểu đồ đã tồn tại, hủy nó trước
  if (myBarChart) {
    myBarChart.destroy(); // Hủy biểu đồ cũ
    myBarChart = null;    // Đặt về null
  }
  // Tạo biểu đồ 
  const fetchedData = await getData(button, inputData); // Lấy dữ liệu từ API
  myBarChart = new Chart(barChartElement, {
      type: "bar",
      data: {
          labels: getLabel(button),
          datasets: [
              {
                  label: getDataName(inputData), // Bạn có thể thay đổi nhãn nếu cần
                  backgroundColor: "rgb(23, 125, 255)",
                  borderColor: "rgb(23, 125, 255)",
                  data: fetchedData, // Dữ liệu đã được lấy từ API
              },
          ],
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              yAxes: [
                  {
                      ticks: {
                          beginAtZero: true,
                      },
                  },
              ],
          },
      },
  });
}

let myLineChart = null ;

async function updateLineChart(button, inputData) {
    var lineChart = document.getElementById("lineChart").getContext("2d");

    // Nếu biểu đồ đã tồn tại, hủy nó trước
    if (myLineChart) {
        myLineChart.destroy(); // Hủy biểu đồ cũ
        myLineChart = null;    // Đặt lại biến toàn cục về null
    }

    // Lấy dữ liệu từ API
    const fetchedData = await getData(button, inputData);

    // Tạo biểu đồ mới
    myLineChart = new Chart(lineChart, {
        type: "line",
        data: {
            labels: getLabel(button), // Lấy labels đúng
            datasets: [
                {
                    label: getDataName(inputData), // Đảm bảo lấy tên đúng
                    borderColor: "#1d7af3",
                    pointBorderColor: "#FFF",
                    pointBackgroundColor: "#1d7af3",
                    pointBorderWidth: 2,
                    pointHoverRadius: 4,
                    pointHoverBorderWidth: 1,
                    pointRadius: 4,
                    backgroundColor: "transparent",
                    fill: true,
                    borderWidth: 2,
                    data: fetchedData, // Cập nhật dữ liệu vào chart
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: "bottom",
                labels: {
                    padding: 10,
                    fontColor: "#1d7af3",
                },
            },
            tooltips: {
                bodySpacing: 4,
                mode: "nearest",
                intersect: 0,
                position: "nearest",
                xPadding: 10,
                yPadding: 10,
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, data) {
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        // Sử dụng label của dataset cho tooltip
                        return dataset.label + ": " + tooltipItem.yLabel;
                    },
                },
            },
            layout: {
                padding: { left: 15, right: 15, top: 15, bottom: 15 },
            },
        },
    });
}

function getLabel(button){
  if(button == "btnToday" || button == "btnYesterday"){
    return [
      "00:00",
      "01:00",
      "02:00",
      "03:00",
      "04:00",
      "05:00",
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "22:00",
      "23:00",
    ];    
  }
  if (button == "btn7Days") {
    const today = new Date(); // Lấy ngày hiện tại
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const result = [];
  
    // Lặp qua 7 ngày từ 7 ngày trước đến hôm nay
    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i); // Tính ngày lùi lại
      const dayName = daysOfWeek[currentDate.getDay()];
      const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`; // Định dạng ngày/tháng
      result.push(`${dayName} ${formattedDate}`);
    }
  
    return result; // Trả về danh sách
  }
  
  if (button == "btn30Days") {
    const today = new Date(); // Lấy ngày hiện tại
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const result = [];
  
    // Lặp qua 30 ngày
    for (let i = 29; i >= 0; i--) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i); // Tính ngày lùi lại
      const dayName = daysOfWeek[currentDate.getDay()];
      const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`; // Định dạng ngày/tháng
      result.push(`${dayName} ${formattedDate}`);
    }
  
    return result; // Trả về danh sách
  }
  if (button == "customDuration") {
    // Lấy startDate và endDate từ sessionStorage
    const startDate = sessionStorage.getItem('startDate');
    const endDate = sessionStorage.getItem('endDate');

    // Kiểm tra nếu không có startDate hoặc endDate
    if (!startDate || !endDate) {
        throw new Error("Thiếu startDate hoặc endDate trong sessionStorage");
    }

    const start = new Date(startDate); // Chuyển startDate thành đối tượng Date
    const end = new Date(endDate); // Chuyển endDate thành đối tượng Date

    // Kiểm tra nếu startDate lớn hơn endDate
    if (start > end) {
        throw new Error("startDate không thể lớn hơn endDate");
    }

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const result = [];

    // Lặp qua từ startDate đến endDate
    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
        const dayName = daysOfWeek[current.getDay()];
        const formattedDate = `${current.getDate()}/${current.getMonth() + 1}`; // Định dạng ngày/tháng
        result.push(`${dayName} ${formattedDate}`);
    }

    return result; // Trả về danh sách
  }
  
}
function getDataName(data){
  if(data == "revenue"){
    return "Doanh thu";
  }else if (data == "orders"){
    return "Đơn hàng";
  }else if(data == "products"){
    return "Tổng sản phẩm";
  } else if (data == "customers"){
    return "Khách hàng mới";
  }else{
    return "Data";
  }
}
async function getData(button, data) {
  try {
      // Lấy startDate và endDate từ sessionStorage
      const startDate = sessionStorage.getItem('startDate');
      const endDate = sessionStorage.getItem('endDate');

      // Nếu button là customDuration và thiếu dữ liệu, báo lỗi
      if (button === 'customDuration' && (!startDate || !endDate)) {
          throw new Error('Thiếu startDate hoặc endDate trong sessionStorage');
      }

      // Tạo payload
      const payload = button === 'customDuration' ? { startDate, endDate } : {};

      // Gửi yêu cầu đến API
      const response = await fetch(`/api/${data}/${button}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: button === 'customDuration' ? JSON.stringify(payload) : null,
      });

      // Kiểm tra nếu phản hồi không thành công
      if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.statusText}`);
      }

      // Xử lý phản hồi JSON
      const result = await response.json();
      console.log(result);
      // Trả về mảng giá trị doanh thu
      return result; 
  } catch (error) {
      console.error('Có lỗi xảy ra:', error);
      return []; // Trả về mảng rỗng nếu có lỗi
  }
}
