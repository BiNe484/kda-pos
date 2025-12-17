  const left = document.getElementById('left-content-order');
  const right = document.getElementById('right-content-order');
  //R-L content
  const leftContent = document.querySelector('.left-content-order');
  const rightContent = document.querySelector('.right-content-order');
  //Cuyển về Process 1
  const process1 = document.getElementById('process1');
  const back2 = document.getElementById('back2');
  //Chuyển về process 2
  const process2 = document.getElementById('process2');
  const next1 = document.getElementById('next1');
  //Chuyển về process3
  const process3 = document.getElementById('process3');
  const next2 = document.getElementById('next2');

  // Ẩn các phần tử ban đầu
  var quantity_totals = document.querySelectorAll('.quantity-total');
      // Lặp qua từng thẻ và đặt display thành 'none'
      quantity_totals.forEach(function(quantity_total) {
        quantity_total.style.display = 'none';
      });

  document.getElementById('process1').style.backgroundColor = 'rgb(0,178,213)';
  document.getElementById('customer').style.display = 'none';
  document.getElementById('next2').style.display = 'none';
  document.getElementById('back2').style.display = 'none';
  document.getElementById('checkout-btn').style.display = 'none';
  document.getElementById('back3').style.display = 'none';
  document.getElementById('payment').style.display = 'none';
  let processActive = false;
  //#####################################################################################################################################################################################################
  // Sự kiện cho process1
  function toProcess1(event) {
      event.preventDefault();
      const parent = leftContent.parentNode;
      
      // Đưa leftContent vào trước rightContent
      parent.insertBefore(leftContent, rightContent);

      if(document.getElementById('process1').style.backgroundColor != 'rgb(0,178,213)'){
        document.getElementById('process1').style.backgroundColor = 'rgb(0,178,213)'
        document.getElementById('process2').style.backgroundColor = 'white'
        document.getElementById('process3').style.backgroundColor = 'white'
        document.getElementById('process3').style.backgroundColor = 'white'
      }

      document.getElementById('next1').style.display = 'block';
      document.getElementById('next2').style.display = 'none';
      document.getElementById('back2').style.display = 'none';
      document.getElementById('checkout-btn').style.display = 'none';
      document.getElementById('back3').style.display = 'none';

      document.getElementById('search').style.display = 'block';
      document.getElementById('list-product').style.display = 'flex';
      document.getElementById('icon-cart').style.display = 'block';
      document.getElementById('list-cart').style.height = '55vh';
      document.getElementById('customer').style.display = 'none';
      document.getElementById('payment').style.display = 'none';

      document.querySelector(".total h3").style.display = 'block';

      left.className = 'left-content-order col-12 col-lg-8'; // Đặt lại class cho left-content-order
      right.className = 'right-content-order col-12 col-lg-4'; // Đặt lại class cho right-content-order

      const total = document.querySelector('.total');
      const rightDiv = document.querySelector('.right-content-order');
            
      // Chuyển phần tử "text" vào trong "left"
      rightDiv.appendChild(total);
      processActive = false;
      renderSelectedProducts();
  };
  //#####################################################################################################################################################################################################

  // Sự kiện cho process2
  function toProcess2(event) {
      event.preventDefault();
      const parent = leftContent.parentNode;

      // Đưa rightContent vào trước leftContent
      parent.insertBefore(rightContent, leftContent);

      if(document.getElementById('process2').style.backgroundColor != 'rgb(0,178,213)'){
        document.getElementById('process2').style.backgroundColor = 'rgb(0,178,213)'
        document.getElementById('process1').style.backgroundColor = 'white'
        document.getElementById('process3').style.backgroundColor = 'white'
      }


      document.getElementById('next1').style.display = 'none';
      document.getElementById('next2').style.display = 'block';
      document.getElementById('back2').style.display = 'block';
      document.getElementById('checkout-btn').style.display = 'none';
      document.getElementById('back3').style.display = 'none';

      document.getElementById('search').style.display = 'none';
      document.getElementById('list-product').style.display = 'none';
      document.getElementById('icon-cart').style.display = 'none';
      document.getElementById('list-cart').style.height = '73.5vh';
      document.getElementById('customer').style.display = 'block';
      document.getElementById('payment').style.display = 'none';

      document.querySelector(".total h3").style.display = 'block';

      left.className = 'left-content-order col-12 col-lg-8'; // Thay đổi class cho left-content-order
      right.className = 'right-content-order col-12 col-lg-4'; // Thay đổi class cho right-content-order

      const total = document.querySelector('.total');
      const leftDiv = document.querySelector('.left-content-order');
            
      // Chuyển phần tử "text" vào trong "left"
      leftDiv.appendChild(total);
      processActive = true;
      renderSelectedProducts();
  };
//#####################################################################################################################################################################################################
  function toProcess3(event) {
      event.preventDefault();

      const parent = leftContent.parentNode;

      // Đưa rightContent vào trước leftContent
      parent.insertBefore(rightContent, leftContent);

      if(document.getElementById('process3').style.backgroundColor != 'rgb(0,178,213)'){
        document.getElementById('process3').style.backgroundColor = 'rgb(0,178,213)'
        document.getElementById('process1').style.backgroundColor = 'white'
        document.getElementById('process2').style.backgroundColor = 'white'
      }

      document.getElementById('next1').style.display = 'none';
      document.getElementById('checkout-btn').style.display = 'block';
      document.getElementById('back3').style.display = 'block';
      document.getElementById('next2').style.display = 'none';
      document.getElementById('back2').style.display = 'none';

      document.getElementById('search').style.display = 'none';
      document.getElementById('list-product').style.display = 'none';
      document.getElementById('icon-cart').style.display = 'none';
      document.getElementById('list-cart').style.height = '73.5vh';
      document.getElementById('customer').style.display = 'none';
      document.getElementById('payment').style.display = 'block';
      document.getElementById('payment').style.height = '61.9vh';

      left.className = 'left-content-order col-12 col-lg-8'; // Thay đổi class cho left-content-order
      right.className = 'right-content-order col-12 col-lg-4'; // Thay đổi class cho right-content-order

      const total = document.querySelector('.total');
      const leftDiv = document.querySelector('.left-content-order');
            
      // Chuyển phần tử "text" vào trong "left"
      leftDiv.appendChild(total);
      processActive = true;
      renderSelectedProducts();
  };


  //Search bar
  function removeVietnameseTones(str) {
    const map = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'Đ': 'D', 'đ': 'd'
    };
    return str.split('').map(char => map[char] || char).join('');
  }

    const searchInput = document.getElementById('search');
    const products = document.querySelectorAll('.product');

    searchInput.addEventListener('input', function() {
        const query = removeVietnameseTones(this.value.toLowerCase());

        products.forEach(product => {
            const productName = removeVietnameseTones(product.querySelector('strong').innerText.toLowerCase());
            if (!productName.includes(query)) {
                product.classList.add('d-none');
            } else {
                product.classList.remove('d-none');
            }
        });
    });
