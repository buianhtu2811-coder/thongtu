/**
 * app.js - Xử lý giao diện người dùng và liên kết dữ liệu Thông Thư, Bát Tự, Hôn Phối, Trùng Tang
 * Đảm bảo tính toán độc lập, an toàn ngoại lệ và hiển thị mượt mà trên mọi trình duyệt.
 */
(function (root) {
  // Polyfill cho NodeList.prototype.forEach và Array methods
  if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if (!String.prototype.trim) {
    String.prototype.trim = function () { return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''); };
  }

  var $ = function (id) { return document.getElementById(id); };
  var queryAll = function (selector) { 
    var nodes = document.querySelectorAll(selector);
    var arr = [];
    for (var i = 0; i < nodes.length; i++) arr.push(nodes[i]);
    return arr;
  };

  // Helper modulo toán học tránh số âm
  function mod(a, n) { return ((a % n) + n) % n; }
  if (root.PT && !root.PT.mod) {
    root.PT.mod = mod;
  }

  var currentYearData = null;
  var currentLunar = null;
  var currentChiIndex = 0;
  var currentCanIndex = 0;
  var currentNapAmHanh = 'Kim';

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // Hỗ trợ mọi định dạng ngày: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  function parseDate(s) {
    if (!s) return null;
    if (typeof s !== 'string') {
      if (s instanceof Date && !isNaN(s.getTime())) {
        return { y: s.getFullYear(), m: s.getMonth() + 1, d: s.getDate() };
      }
      return null;
    }
    s = s.trim();
    var p = s.split(/[-/.]/).map(function (v) { return parseInt(v, 10); });
    if (p.length < 3 || isNaN(p[0]) || isNaN(p[1]) || isNaN(p[2])) return null;

    if (p[0] > 31) {
      // Dạng YYYY-MM-DD
      return { y: p[0], m: p[1], d: p[2] };
    } else if (p[2] > 31) {
      // Dạng DD-MM-YYYY hoặc DD/MM/YYYY
      return { y: p[2], m: p[1], d: p[0] };
    }
    // Mặc định YYYY-MM-DD
    return { y: p[0], m: p[1], d: p[2] };
  }

  // Tách lấy ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ) từ chuỗi nạp âm hoặc tên mệnh
  function layHanh(str) {
    if (!str) return 'Kim';
    var m = str.match(/(Kim|Mộc|Thủy|Hỏa|Thổ)/i);
    return m ? m[1] : 'Kim';
  }

  // Quan hệ ngũ hành tương sinh / tương khắc an toàn
  function getQuanHeMenh(h1, h2) {
    var c1 = layHanh(h1);
    var c2 = layHanh(h2);
    if (root.LogicTT && typeof root.LogicTT.quanHeMenh === 'function') {
      return root.LogicTT.quanHeMenh(c1, c2);
    }
    if (root.Tuoi && typeof root.Tuoi.quanHeMenh === 'function') {
      return root.Tuoi.quanHeMenh(c1, c2);
    }
    return c1 + ' và ' + c2;
  }

  // Khởi tạo ngày hiện tại
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
  if ($('dateXemNgay')) $('dateXemNgay').value = todayStr;
  if ($('namXet')) $('namXet').value = today.getFullYear();

  // Tab switching với vòng lặp an toàn
  var tabButtons = queryAll('.tab-btn');
  for (var i = 0; i < tabButtons.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        var allBtns = queryAll('.tab-btn');
        for (var b = 0; b < allBtns.length; b++) allBtns[b].classList.remove('active');
        var allContents = queryAll('.tab-content');
        for (var c = 0; c < allContents.length; c++) allContents[c].classList.remove('active');

        btn.classList.add('active');
        var target = btn.getAttribute('data-tab');
        if ($(target)) $(target).classList.add('active');
        if (target === 'tab5') {
          dongBoLaSoTuVi();
        } else if (target === 'tab6') {
          if (root.BatTuTuTru && typeof root.BatTuTuTru.syncBaziFromAppInputs === 'function') {
            root.BatTuTuTru.syncBaziFromAppInputs();
          }
        }
      });
    })(tabButtons[i]);
  }

  if ($('btnSyncTuViNow')) {
    $('btnSyncTuViNow').addEventListener('click', function () {
      dongBoLaSoTuVi();
    });
  }

  function dongBoLaSoTuVi() {
    var frame = $('tuviFrame');
    if (!frame) return;
    var dobVal = $('dob') ? $('dob').value : '2003-11-27';
    var dob = parseDate(dobVal) || { y: 2003, m: 11, d: 27 };
    var gioiTinh = $('gioiTinh') ? $('gioiTinh').value : 'nam';
    var gioSinhIdx = $('gioSinh') ? parseInt($('gioSinh').value, 10) : 10;
    var namXetVal = ($('namXet') && parseInt($('namXet').value, 10)) ? parseInt($('namXet').value, 10) : today.getFullYear();
    var canName = PT.CAN[currentCanIndex] || '';
    var chiName = PT.CHI[currentChiIndex] || '';

    var payload = {
      type: 'SYNC_TUVI',
      sd: dob.d,
      sm: dob.m,
      sy: dob.y,
      gender: gioiTinh === 'nu' ? 'Nữ' : 'Nam',
      hourChi: gioSinhIdx,
      viewYear: namXetVal,
      name: 'Tuổi ' + canName + ' ' + chiName + ' (' + dob.d + '/' + dob.m + '/' + dob.y + ')'
    };

    try {
      localStorage.setItem('ttbc_duong_so', JSON.stringify(payload));
    } catch (e) {}

    try {
      if (window.__TUVI_SRCDOC__ && !frame._srcdocLoaded) {
        frame._srcdocLoaded = true;
        frame.srcdoc = window.__TUVI_SRCDOC__;
      } else if (!frame._srcdocLoaded && !frame.getAttribute('srcdoc')) {
        var curSrc = frame.getAttribute('src') || '';
        if (curSrc.indexOf('tuvi/index.html') === 0) {
          var baseUrl = curSrc.split('#')[0];
          var hashStr = '#sd=' + dob.d +
            '&sm=' + dob.m +
            '&sy=' + dob.y +
            '&gender=' + encodeURIComponent(payload.gender) +
            '&hc=' + gioSinhIdx +
            '&vy=' + namXetVal +
            '&name=' + encodeURIComponent(payload.name);
          if (curSrc !== baseUrl + hashStr) {
            frame.setAttribute('src', baseUrl + hashStr);
          }
        }
      }
    } catch (e) {}

    try {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage(payload, '*');
        frame.contentWindow.postMessage({ type: 'FIT_TUVI' }, '*');
      }
    } catch (e) {}
  }

  window.addEventListener('message', function (ev) {
    if (ev && ev.data && ev.data.type === 'TUVI_READY') {
      dongBoLaSoTuVi();
    } else if (ev && ev.data && ev.data.type === 'RESIZE_TUVI_FRAME') {
      var fr = $('tuviFrame');
      if (fr && ev.data.height) {
        fr.style.height = Math.max(750, ev.data.height) + 'px';
      }
    } else if (ev && ev.data && ev.data.type === 'SCROLL_TUVI_TO') {
      var frScroll = $('tuviFrame');
      if (frScroll && typeof ev.data.offsetTop === 'number') {
        var rect = frScroll.getBoundingClientRect();
        var targetY = rect.top + window.pageYOffset + ev.data.offsetTop - 16;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }
  });

  if ($('tuviFrame')) {
    $('tuviFrame').addEventListener('load', function () {
      dongBoLaSoTuVi();
    });
  }

  // Tự động đồng bộ ngay khi thay đổi Ngày sinh, Giới tính, Giờ sinh, Năm xem hạn ở khung chính
  ['dob', 'gioiTinh', 'gioSinh', 'namXet'].forEach(function (id) {
    if ($(id)) {
      $(id).addEventListener('change', function () {
        traCuuToanDien();
      });
      $(id).addEventListener('input', function () {
        traCuuToanDien();
      });
    }
  });

  // Sự kiện Form chính
  if ($('mainForm')) {
    $('mainForm').addEventListener('submit', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      traCuuToanDien();
      return false;
    });
  }

  // Sự kiện Quét Tìm Ngày Đẹp Hợp Tuổi
  if ($('btnQuetNgayDep')) {
    $('btnQuetNgayDep').addEventListener('click', function () {
      chayQuetNgayDep();
    });
  }

  // Sự kiện Tab 3: Xem ngày Thông Thư Chi Tiết
  if ($('btnXemNgay')) {
    $('btnXemNgay').addEventListener('click', function () {
      traCuuNgayThongThu();
    });
  }

  // Sự kiện Tab 5: So tuổi vợ chồng & đẻ con
  if ($('btnSoCung')) {
    $('btnSoCung').addEventListener('click', function () {
      tinhTuoiVoChong();
    });
  }

  if ($('btnTinhSinhCon')) {
    $('btnTinhSinhCon').addEventListener('click', function () {
      chayKeHoachSinhCon();
    });
  }

  if ($('btnTraCon')) {
    $('btnTraCon').addEventListener('click', function () {
      traConGi();
    });
  }

  if ($('btnTraiGai')) {
    $('btnTraiGai').addEventListener('click', function () {
      traTraiGai();
    });
  }

  // Tự động cập nhật khi đổi năm sinh Chồng / Vợ
  if ($('txtNamChong')) {
    $('txtNamChong').addEventListener('input', function () {
      tinhTuoiVoChong();
      chayKeHoachSinhCon();
    });
  }
  if ($('txtNamVo')) {
    $('txtNamVo').addEventListener('input', function () {
      tinhTuoiVoChong();
      chayKeHoachSinhCon();
      traTraiGai();
    });
  }

  // Tự động cập nhật tính trùng tang khi thay đổi thông tin
  ['tangNamSinh', 'tangNamChet', 'tangThangChet', 'tangNgayChet', 'tangGioChet', 'tangGioiTinh'].forEach(function (id) {
    if ($(id)) {
      $(id).addEventListener('change', function () {
        chayTinhTrungTang();
      });
      $(id).addEventListener('input', function () {
        chayTinhTrungTang();
      });
    }
  });

  // Sự kiện Tab 7: Tính Trùng Tang
  if ($('tangForm')) {
    $('tangForm').addEventListener('submit', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      chayTinhTrungTang();
      return false;
    });
  }

  // ==============================================================
  // HÀM TRA CỨU TOÀN DIỆN KHI BẤM "TRA CỨU NGAY"
  // ==============================================================
  function traCuuToanDien() {
    // 1. Luôn hiển thị khu vực kết quả ngay lập tức
    if ($('resultArea')) {
      $('resultArea').style.display = 'block';
    }

    var dobVal = $('dob') ? $('dob').value : '2003-11-27';
    var dob = parseDate(dobVal) || { y: 2003, m: 11, d: 27 };
    var gioiTinh = $('gioiTinh') ? $('gioiTinh').value : 'nam';
    var gioSinhIdx = $('gioSinh') ? parseInt($('gioSinh').value, 10) : 10;
    var namXetVal = ($('namXet') && parseInt($('namXet').value, 10)) ? parseInt($('namXet').value, 10) : today.getFullYear();

    // 2. Chuyển đổi Dương Lịch -> Âm Lịch (Hồ Ngọc Đức)
    var lunar = Lunar.solar2Lunar(dob.d, dob.m, dob.y);
    currentLunar = lunar;

    var lunarYear = lunar.year;
    currentCanIndex = mod(lunarYear + 6, 10);
    currentChiIndex = mod(lunarYear + 8, 12);

    var canName = PT.CAN[currentCanIndex];
    var chiName = PT.CHI[currentChiIndex];
    var conGiap = PT.CON_GIAP[currentChiIndex];
    var icon = PT.CON_ICON[currentChiIndex];

    var yData = PT.getTuoiData(lunarYear);
    currentYearData = yData;

    // Lấy ngũ hành nạp âm của đương số
    var naObj = LogicTT.getNapAm(currentCanIndex, currentChiIndex);
    currentNapAmHanh = naObj.hanh;

    var isNam = (gioiTinh === 'nam');
    var cung = yData ? (isNam ? yData.cungNam : yData.cungNu) : '';
    var tuTrach = yData ? (isNam ? yData.tuTrachNam : yData.tuTrachNu) : '';
    var mang = yData ? yData.mang : naObj.ten;

    // 1. TÍNH TOÁN TUỔI CHUẨN XÁC THEO PHONG TỤC CỔ TRUYỀN Á ĐÔNG
    // A. Thời điểm tra cứu hiện tại (Hôm nay)
    var lunarToday = Lunar.solar2Lunar(today.getDate(), today.getMonth() + 1, today.getFullYear());
    var currentLunarYear = lunarToday.year; // Năm Âm lịch hiện tại (Ví dụ 2026 - Bính Ngọ)
    var canChiLunarToday = PT.CAN[mod(currentLunarYear + 6, 10)] + ' ' + PT.CHI[mod(currentLunarYear + 8, 12)];

    // B. Tuổi dương hiện tại (tính chính xác theo ngày tháng sinh nhật đến hôm nay)
    var tuoiDuongHienTai = today.getFullYear() - dob.y;
    if (today.getMonth() + 1 < dob.m || (today.getMonth() + 1 === dob.m && today.getDate() < dob.d)) {
      tuoiDuongHienTai--;
    }

    // C. Tuổi mụ hiện tại: Năm Âm lịch hiện tại - Năm sinh Âm lịch + 1
    var tuoiMuHienTai = currentLunarYear - lunarYear + 1;

    // D. Tuổi mụ năm xem vận hạn: Năm xét Âm lịch - Năm sinh Âm lịch + 1
    var tuoiMuNamXet = namXetVal - lunarYear + 1;
    var tuoiMu = tuoiMuNamXet; // Biến đồng bộ dùng cho các phép luận Cửu Diệu, Bát Hạn, Kim Lâu, Hoang Ốc của năm xét

    // A. BANNER TỔNG QUAN
    try {
      if ($('heroIcon')) $('heroIcon').textContent = icon;
      if ($('heroTitle')) $('heroTitle').textContent = 'Tuổi ' + canName + ' ' + chiName + ' • ' + lunarYear + ' • ' + conGiap;
      var cleanCung = cung ? cung.replace(/\s*\((.*?)\)/g, ' • Hành $1') : '';
      if ($('heroSubtitle')) $('heroSubtitle').textContent = (isNam ? 'Âm Nam' : 'Âm Nữ') + ' • Cung ' + cleanCung + ' • ' + tuTrach + ' • Mạng ' + mang;

      if ($('heroBadges')) {
        var isSinhTruocTet = (lunarYear !== dob.y);
        var badgeHtml = 
          '<span class="badge gold">Âm lịch: ' + pad(lunar.day) + '/' + pad(lunar.month) + (lunar.leap ? ' Nhuận' : '') + '/' + lunarYear + ' • ' + canName + ' ' + chiName + '</span>' +
          '<span class="badge">Dương lịch: ' + pad(dob.d) + '/' + pad(dob.m) + '/' + dob.y + '</span>' +
          '<span class="badge">Giờ sinh: ' + PT.CHI[gioSinhIdx] + '</span>' +
          '<span class="badge">Tuổi dương hiện tại: ' + tuoiDuongHienTai + ' tuổi</span>' +
          '<span class="badge">Tuổi mụ hiện tại: ' + tuoiMuHienTai + ' tuổi</span>';

        if (namXetVal !== currentLunarYear) {
          badgeHtml += '<span class="badge gold">Tuổi mụ năm ' + namXetVal + ': ' + tuoiMuNamXet + ' tuổi</span>';
        }

        if (isSinhTruocTet) {
          badgeHtml += '<span class="badge bad" style="background:#451a03; border-color:#d97706; color:#fde68a;">Sinh trước Tết Nguyên Đán • Thuộc năm Âm lịch ' + lunarYear + ' (' + canName + ' ' + chiName + ')</span>';
        }

        $('heroBadges').innerHTML = badgeHtml;
      }

      if ($('heroTuoiMuNoteText')) {
        var explainText = 'Quy ước tuổi mụ Á Đông: Tuổi mụ = Năm xét Âm lịch (' + namXetVal + ') - Năm sinh Âm lịch (' + lunarYear + ') + 1 = ' + tuoiMuNamXet + ' tuổi mụ.';
        if (namXetVal !== currentLunarYear) {
          explainText += ' (Năm nay ' + currentLunarYear + ' ' + canChiLunarToday + ': Đương số tròn ' + tuoiMuHienTai + ' tuổi mụ, ' + tuoiDuongHienTai + ' tuổi dương).';
        }
        $('heroTuoiMuNoteText').textContent = explainText;
      }
    } catch (eHero) {
      console.warn('Lỗi hiển thị banner:', eHero);
    }

    // B. ĐIỀN TAB 1: BẢN MỆNH & BÁT TRẠCH
    try {
      if (yData) {
        if ($('txtMang')) $('txtMang').textContent = yData.mang;
        if ($('txtCung')) {
          var rawCung = isNam ? yData.cungNam : yData.cungNu;
          $('txtCung').textContent = rawCung ? rawCung.replace(/\s*\((.*?)\)/g, ' • Hành $1') : '';
        }
        if ($('txtTuTrach')) $('txtTuTrach').textContent = isNam ? yData.tuTrachNam : yData.tuTrachNu;
        if ($('txtHopHanh')) $('txtHopHanh').textContent = isNam ? yData.hopHanhNam : yData.hopHanhNu;
        if ($('txtMauHop')) $('txtMauHop').textContent = isNam ? yData.mauHopNam : yData.mauHopNu;
        if ($('txtSoHop')) $('txtSoHop').textContent = isNam ? yData.soHopNam : yData.soHopNu;
        if ($('txtTuoiKhac')) $('txtTuoiKhac').textContent = yData.tuoiKhac || 'Không có';

        if ($('txtHuongNha')) $('txtHuongNha').textContent = (isNam ? yData.huongNhaNam : yData.huongNhaNu) || 'Đang cập nhật...';
        if ($('txtHuongBep')) $('txtHuongBep').textContent = (isNam ? yData.huongBepNam : yData.huongBepNu) || 'Đang cập nhật...';
        if ($('txtHuongVeSinh')) $('txtHuongVeSinh').textContent = (isNam ? yData.huongVeSinhNam : yData.huongVeSinhNu) || 'Đang cập nhật...';

        var vp = isNam ? yData.vatPhamNam : yData.vatPhamNu;
        if (vp) {
          if ($('txtVpSucKhoe')) $('txtVpSucKhoe').textContent = vp.sucKhoe || 'Thanh lọc không gian, bài trí cây xanh hợp mệnh';
          if ($('txtVpTriTue')) $('txtVpTriTue').textContent = vp.triTue || 'Đặt tháp Văn Xương, bút lông hoặc bàn làm việc hướng cát';
          if ($('txtVpCongDanh')) $('txtVpCongDanh').textContent = vp.congDanh || 'Đặt ấn ngọc thăng quan, tượng linh vật phong thủy';
          if ($('txtVpTaiLoc')) $('txtVpTaiLoc').textContent = vp.taiLoc || 'Đặt bể cá, tượng Thiềm Thừ chiêu tài hướng Sinh Khí';
        }

        if ($('txtTenNenDat')) $('txtTenNenDat').textContent = (isNam ? yData.tenNenDatNam : yData.tenNenDatNu) || 'Phương, Lương, Vinh, Tuấn, Đạt...';
        if ($('txtTuViTronDoi')) $('txtTuViTronDoi').textContent = (isNam ? yData.tuViTronDoiNam : yData.tuViTronDoiNu) || 'Đang cập nhật...';

        var h = isNam ? yData.huongNam : yData.huongNu;
        if (h && $('tblHuong')) {
          $('tblHuong').innerHTML = 
            '<tr><td><strong>Sinh Khí:</strong> ' + h.sinhKhi + ' • Hưng vượng, tài lộc</td><td><strong>Tuyệt Mệnh:</strong> ' + h.tuyetMenh + ' • Họa hại nặng, kiêng kỵ</td></tr>' +
            '<tr><td><strong>Thiên Y:</strong> ' + h.thienY + ' • Sức khỏe, bình an</td><td><strong>Ngũ Quỷ:</strong> ' + h.nguQuy + ' • Thị phi, mất mát</td></tr>' +
            '<tr><td><strong>Diên Niên:</strong> ' + h.dienNien + ' • Gia đạo thuận hòa</td><td><strong>Lục Sát:</strong> ' + h.lucSat + ' • Tai ương, tranh chấp</td></tr>' +
            '<tr><td><strong>Phục Vị:</strong> ' + h.phucVi + ' • Vững chãi, củng cố sức mạnh</td><td><strong>Họa Hại:</strong> ' + h.hoaHai + ' • Khó khăn, trắc trở</td></tr>';
        }
      }

      var thangTotMap = {
        'Tý': '1, 2, 7, 8, 9', 'Sửu': '2, 3, 8, 9, 10', 'Dần': '1, 3, 4, 9, 10, 11', 'Mão': '2, 4, 5, 10, 11, 12',
        'Thìn': '1, 3, 5, 6, 11, 12', 'Tị': '2, 4, 6, 7, 12', 'Ngọ': '1, 3, 5, 7, 8', 'Mùi': '1, 6, 7, 8, 9, 10, 12',
        'Thân': '2, 4, 6, 8, 9', 'Dậu': '3, 5, 7, 9, 10', 'Tuất': '1, 4, 6, 8, 10, 11', 'Hợi': '2, 5, 7, 9, 11, 12'
      };
      var ngayTotMap = {
        'Mùi': 'Mùi, Thân, Dậu, Tuất, Hợi, Sửu, Dần',
        'Tý': 'Thân, Thìn, Sửu, Hợi',
        'Sửu': 'Tỵ, Dậu, Tý, Mão',
        'Dần': 'Ngọ, Tuất, Hợi, Mão',
        'Mão': 'Mùi, Hợi, Tuất, Dần',
        'Thìn': 'Tý, Thân, Dậu, Hợi',
        'Tị': 'Sửu, Dậu, Thân, Thìn',
        'Ngọ': 'Dần, Tuất, Mùi, Mão',
        'Thân': 'Tý, Thìn, Tỵ, Mùi',
        'Dậu': 'Sửu, Tỵ, Thìn, Hợi',
        'Tuất': 'Dần, Ngọ, Mão, Hợi',
        'Hợi': 'Mão, Mùi, Dần, Tý'
      };
      if ($('txtThangTot')) $('txtThangTot').textContent = thangTotMap[chiName] || 'Tháng Tam Hợp, Lục Hợp';
      if ($('txtNgayTot')) $('txtNgayTot').textContent = ngayTotMap[chiName] || 'Các ngày Tam Hợp, Lục Hợp với tuổi';
    } catch (eTab1) {
      console.warn('Lỗi nạp Tab 1:', eTab1);
    }

    // C. ĐIỀN TAB 2: VẬN HẠN NĂM NAY (BỔ SUNG CHI TIẾT Á ĐÔNG: CỬU DIỆU, BÁT HẠN, KIM LÂU, HOANG ỐC, LƯU NGUYỆT)
    try {
      if ($('lblNamXet')) $('lblNamXet').textContent = namXetVal;
      if ($('lblNamXetBang')) $('lblNamXetBang').textContent = namXetVal;
      var canChiNamXet = PT.CAN[mod(namXetVal + 6, 10)] + ' ' + PT.CHI[mod(namXetVal + 8, 12)];
      if ($('lblCanChiNamXet')) $('lblCanChiNamXet').textContent = canChiNamXet;
      if ($('lblTuoiMu')) $('lblTuoiMu').textContent = tuoiMu;

      // Cập nhật thẻ giải thích căn cứ tính tuổi mụ xét vận hạn
      if ($('vhDobDuong')) $('vhDobDuong').textContent = pad(dob.d) + '/' + pad(dob.m) + '/' + dob.y;
      if ($('vhCanChiSinh')) $('vhCanChiSinh').textContent = canName + ' ' + chiName;
      if ($('vhNamSinhAm')) $('vhNamSinhAm').textContent = lunarYear;
      if ($('vhNamXet')) $('vhNamXet').textContent = namXetVal;
      if ($('vhCanChiXet')) $('vhCanChiXet').textContent = canChiNamXet;
      if ($('vhNamXet2')) $('vhNamXet2').textContent = namXetVal;
      if ($('vhNamSinhAm2')) $('vhNamSinhAm2').textContent = lunarYear;
      if ($('vhTuoiMu')) $('vhTuoiMu').textContent = tuoiMu;
      if ($('vhTuoiMu2')) $('vhTuoiMu2').textContent = tuoiMu;

      var ptData = PT.getPhongThuyData();
      var saoItem = ptData.saoHan ? ptData.saoHan[String(tuoiMu)] : null;
      var fb = PT.getCuuDieuBatHanFallback(tuoiMu, isNam);
      var tenSao = saoItem ? (isNam ? saoItem.saoNam : saoItem.saoNu) : fb.sao;
      var tenHan = saoItem ? (isNam ? saoItem.hanNam : saoItem.hanNu) : fb.han;

      var cleanSao = tenSao.replace(/\s*\([NT]\)/g, '').trim();
      var loaiSaoText = (tenSao.indexOf('(T)') >= 0 || cleanSao === 'Thái Dương' || cleanSao === 'Thái Âm' || cleanSao === 'Mộc Đức') ? 'Cát Tinh' : (cleanSao === 'Thủy Diệu' ? 'Trung Tinh' : 'Hung Tinh');
      if ($('boxSaoChieu')) $('boxSaoChieu').textContent = 'Sao ' + cleanSao + ' • ' + loaiSaoText;
      if ($('boxHanTuoi')) $('boxHanTuoi').textContent = tenHan;

      var saoDetail = ptData.yNghiaSao ? ptData.yNghiaSao[cleanSao] : null;
      if (saoDetail) {
        if ($('descSaoChieu')) $('descSaoChieu').textContent = saoDetail.yNghia;
        if ($('cungBaiVi')) $('cungBaiVi').textContent = saoDetail.baiVi;
        if ($('cungMau')) $('cungMau').textContent = saoDetail.mauSac;
        if ($('cungGio')) $('cungGio').textContent = saoDetail.gioCung + ' • Ngày ' + saoDetail.ngayCung;
        if ($('cungNen')) $('cungNen').textContent = saoDetail.nen;
        if ($('cungHuong')) $('cungHuong').textContent = saoDetail.huong;
        if ($('boxGiaiHanSao')) $('boxGiaiHanSao').style.display = 'block';

        if ($('vanKhanSao')) {
          $('vanKhanSao').innerHTML = 
            'Nam mô A Di Đà Phật! (3 lần)<br>' +
            '- Con lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.<br>' +
            '- Nam mô Hiệu Thiên chí tôn Kim Quyết Ngọc Hoàng Thượng đế.<br>' +
            '- Con kính lạy Đức Trung Thiên tinh chúa Bắc cực Tử vi Tràng Sinh Đại đế.<br>' +
            '- Con kính lạy ngài Tả Nam Tào Lục Ty Duyên Thọ Tinh quân.<br>' +
            '- Con kính lạy Đức Hữu Bắc Đẩu Cửu hàm Giải ách Tinh quân.<br>' +
            '- Con kính lạy Đức <strong>' + saoDetail.baiVi + '</strong> vị tiền.<br>' +
            'Hôm nay là ngày ' + saoDetail.ngayCung + ' năm ' + canChiNamXet + ' • ' + namXetVal + '. Tín chủ con thành tâm sắm sửa hương hoa phẩm vật, thiết lập linh án quay về hướng ' + saoDetail.huong + ', thắp ' + saoDetail.nen + ' để làm lễ Nghinh Sao Giải Hạn.<br>' +
            'Cúi xin chư vị Tinh Quân giáng lâm trước án, chứng giám lòng thành, phù hộ độ trì cho con và toàn thể gia quyến tiêu trừ tai ách, thân cung khang thái, vạn sự cát tường, sở cầu tất ứng.';
        }
      } else {
        if ($('descSaoChieu')) $('descSaoChieu').textContent = 'Sao chiếu mệnh trong năm.';
        if ($('boxGiaiHanSao')) $('boxGiaiHanSao').style.display = 'none';
      }

      // 1. Thơ Cửu Diệu Lưu Niên
      var THO_CUU_DIEU = {
        'Thái Dương': ['Thái Dương chiếu mệnh sáng ngời,', 'Mười hai tháng đặng thảnh thơi an nhàn.', 'Làm ăn phát đạt giàu sang,', 'Gia đạo hưng vượng bình an trọn đời.'],
        'Thái Âm': ['Thái Âm rực rỡ cung trời,', 'Tiền tài danh vọng trọn đời ấm êm.', 'Tháng chín hỷ sự đề huề,', 'Cầu tài đắc lộc trăm bề sướng vui.'],
        'Mộc Đức': ['Mộc Đức sao tốt an vui,', 'Hôn nhân hỷ sự ngậm ngùi tiêu tan.', 'Tháng mười, tháng chạp hân hoan,', 'Tài lộc tấn tới ngập tràn niềm vui.'],
        'Vân Hớn': ['Vân Hớn hỏa tinh phòng ngừa,', 'Khẩu thiệt thị phi chớ đùa dây oan.', 'Tháng hai, tháng tám lo toan,', 'Gìn giữ lời nói tránh vành tai bay.'],
        'Thổ Tú': ['Thổ Tú mờ mịt đêm thâu,', 'Gia đạo bất hòa lo âu đêm ngày.', 'Tháng tư, tháng tám đắng cay,', 'Tiểu nhân quấy phá đổi thay khôn lường.'],
        'Thủy Diệu': ['Thủy Diệu ngũ hành thuộc Thủy,', 'Tháng tư, tháng tám phân kỳ nước sông.', 'Nam giới tài lộc hanh thông,', 'Nữ giới khẩu thiệt chớ trông cậy người.'],
        'La Hầu': ['La Hầu khẩu thiệt tai ương,', 'Đàn ông nặng gánh lo lường thị phi.', 'Tháng giêng, tháng bảy biệt ly,', 'Phòng ngừa bệnh tật quản gì gian nan.'],
        'Kế Đô': ['Kế Đô chiếu mệnh năm nay,', 'Tháng ba, tháng chín sầu bi lệ trào.', 'Ám muội thị phi lao đao,', 'Gia quyến bất an nghẹn ngào tâm can.'],
        'Thái Bạch': ['Thái Bạch quét sạch cửa nhà,', 'Tiền bạc hao tán thật là gian nan.', 'Tháng năm đại kỵ nguy nàn,', 'Giữ gìn của cải chớ than thở lòng.']
      };
      if ($('poemSaoChieu')) {
        $('poemSaoChieu').innerHTML = (THO_CUU_DIEU[cleanSao] || ['Sao chiếu mệnh lưu niên theo quy luật Cửu Diệu.']).join('<br>');
      }

      // 2. Thơ Bát Niên Hạn
      var THO_BAT_HAN = {
        'Huỳnh Tuyền': ['Huỳnh Tuyền bệnh nặng nguy vong,', 'Tam Kheo đau mắt đề phòng tay chân.', 'Chớ đi đường thủy phân vân,', 'Cầu tài chớ vội hao thân tốn tiền.'],
        'Tam Kheo': ['Tam Kheo đau mắt đề phòng tay chân,', 'Tránh nơi xô xát chớ gần kẻ gian.', 'Đi đứng cẩn trọng bình an,', 'Mắt mờ gối mỏi lo toan giữ mình.'],
        'Ngũ Mộ': ['Ngũ Mộ hạn xấu tổn tài,', 'Mua đồ không hóa đơn hoài tốn hao.', 'Chớ cho ngủ trọ đêm sâu,', 'Kẻ gian trộm cắp ngõ hầu trắng tay.'],
        'Thiên Tinh': ['Thiên Tinh mắc phải dạ tai ngục hình,', 'Ăn uống cẩn trọng giữ mình chớ quên.', 'Thai phụ phòng việc chẳng nên,', 'Đề phòng ngộ độc chớ bền âu lo.'],
        'Tán Tận': ['Tán Tận tật ách kinh hoàng,', 'Ra đường mang của dễ đàng trắng tay.', 'Chớ đi đêm tối gió bay,', 'Đề phòng tai nạn tháng ngày gian truân.'],
        'Thiên La': ['Thiên La quỷ quái ma vương,', 'Gia đạo bất hòa vấn vương đêm ngày.', 'Vợ chồng nhường nhịn chớ cay,', 'Giữ tâm trong sạch thẳng ngay cõi lòng.'],
        'Địa Võng': ['Địa Võng tai tiếng thị phi,', 'Chớ đi đêm tối biệt ly cửa nhà.', 'Lời ăn tiếng nói điều hòa,', 'Làm ăn minh bạch mới là bình yên.'],
        'Diêm Vương': ['Diêm Vương thưa kiện khóc than,', 'Nữ nhân sản nạn muôn vàn đắng cay.', 'Người bệnh chớ để lâu ngày,', 'Kịp thời chữa trị qua tai nạn này.']
      };
      if ($('poemHanTuoi')) {
        $('poemHanTuoi').innerHTML = (THO_BAT_HAN[tenHan] || ['Niên hạn lưu chuyển theo tuổi mụ.']).join('<br>');
      }

      // 3. Tính Hạn Kim Lâu
      var resKimLau = PT.kiemTraKimLau(tuoiMu);
      if ($('boxKimLau')) {
        if (resKimLau.pham) {
          $('boxKimLau').innerHTML = '<span class="badge bad">' + resKimLau.loai + '</span><div class="subtext" style="margin-top:4px;">' + resKimLau.moTa + '</div>';
        } else {
          $('boxKimLau').innerHTML = '<span class="badge good">' + resKimLau.loai + '</span><div class="subtext" style="margin-top:4px;">' + resKimLau.moTa + '</div>';
        }
      }

      // 4. Tính Hạn Hoang Ốc
      var resHoangOc = PT.kiemTraHoangOc(tuoiMu);
      if ($('boxHoangOc')) {
        var hoCls = resHoangOc.laTot ? 'good' : 'bad';
        $('boxHoangOc').innerHTML = '<span class="badge ' + hoCls + '">' + resHoangOc.ten + ' • ' + resHoangOc.tinhChat + '</span><div class="subtext" style="margin-top:4px;">' + resHoangOc.moTa + '</div>';
      }

      // 5. Tính Tam Tai
      var chiNamXetIdx = mod(namXetVal + 8, 12);
      var resTamTai = PT.kiemTraTamTai(currentChiIndex, chiNamXetIdx);
      if (resTamTai.pham) {
        if ($('boxTamTai')) $('boxTamTai').innerHTML = '<span class="badge bad">Phạm Tam Tai • Năm thứ ' + resTamTai.namThu + '</span>';
        if ($('descTamTaiChiTiet')) {
          var loaiTT = resTamTai.namThu === 1 ? 'Năm đầu • Hỏa Tai: Kiêng khởi công bắt đầu những việc trọng đại.' : (resTamTai.namThu === 2 ? 'Năm giữa • Thủy Tai: Nặng nhất, tuyệt đối không dừng ngang công việc đang làm dở.' : 'Năm cuối • Phong Tai: Kiêng kết thúc đại sự vào năm này.');
          $('descTamTaiChiTiet').textContent = loaiTT;
        }
        if ($('boxGiaiTamTai')) $('boxGiaiTamTai').style.display = 'block';
      } else {
        if ($('boxTamTai')) $('boxTamTai').innerHTML = '<span class="badge good">Không phạm Tam Tai</span>';
        if ($('descTamTaiChiTiet')) $('descTamTaiChiTiet').textContent = 'Năm nay vận thế bình hòa, tuổi của đương số không phạm vào 3 năm Tam Tai liên tiếp.';
        if ($('boxGiaiTamTai')) $('boxGiaiTamTai').style.display = 'none';
      }

      var lc = ptData.luanChi ? ptData.luanChi[chiName] : null;
      if (lc) {
        if ($('ttQuan')) $('ttQuan').textContent = lc.quanHanhKhien || 'Cai quản niên khóa';
        if ($('ttNgayHuong')) $('ttNgayHuong').textContent = lc.cungTamTai || 'Theo truyền thống cổ thư';
        if ($('ttLeVat')) $('ttLeVat').textContent = lc.leVatTamTai || 'Bộ tam sinh, thế cô hình hổ, muối gạo, đèn nến, tóc móng tay.';
      }

      // 6. Ngũ Đại Phạm Thái Tuế
      var listThaiTue = PT.kiemTraThaiTue(currentChiIndex, chiNamXetIdx);
      if (listThaiTue.length > 0) {
        var ttBadges = listThaiTue.map(function (t) { return '<span class="badge bad">' + t.loai + '</span>'; }).join(' ');
        var ttDesc = listThaiTue.map(function (t) { return t.moTa; }).join(' ');
        if ($('boxThaiTue')) $('boxThaiTue').innerHTML = ttBadges + '<div class="subtext" style="margin-top:6px; line-height:1.6;">' + ttDesc + '</div>';
      } else {
        if ($('boxThaiTue')) $('boxThaiTue').innerHTML = '<span class="badge good">Không phạm Thái Tuế</span><div class="subtext" style="margin-top:4px;">Năm nay khí trường bình ổn, không xung đột trực tiếp với Thái Tuế Lưu Niên.</div>';
      }

      // 7. Bảng Lưu Nguyệt 12 Tháng Âm Lịch Trong Năm Xét
      var list12 = PT.tinhLuuNguyet12Thang(namXetVal, currentCanIndex, currentChiIndex, currentNapAmHanh);
      if ($('tblLuuNguyet') && list12) {
        $('tblLuuNguyet').innerHTML = list12.map(function (t) {
          return '<tr>' +
            '<td><strong>' + t.tenThangAm + '</strong></td>' +
            '<td><b style="color:var(--gold);">' + t.canChi + '</b></td>' +
            '<td><span class="badge ' + t.cls + '">' + t.danhGia + '</span></td>' +
            '<td style="line-height:1.6;">' + t.ghiChu + '</td>' +
            '</tr>';
        }).join('');
      }
    } catch (eTab2) {
      console.warn('Lỗi nạp Tab 2:', eTab2);
    }

    // D. ĐIỀN TAB 3: THƠ TUỔI & LUẬN GIẢI
    try {
      var ptData3 = PT.getPhongThuyData();
      var thoTuoiArr = ptData3.thoChi ? ptData3.thoChi[chiName] : [];
      if ($('poemTuoi')) $('poemTuoi').innerHTML = (thoTuoiArr && thoTuoiArr.length > 0) ? thoTuoiArr.join('<br>') : 'Đang cập nhật bài thơ...';

      if ($('lblTenCan')) $('lblTenCan').textContent = canName;
      var thoCanArr = ptData3.thoCan ? ptData3.thoCan[canName] : [];
      if ($('poemCan')) $('poemCan').innerHTML = (thoCanArr && thoCanArr.length > 0) ? thoCanArr.join('<br>') : 'Đang cập nhật bài thơ hàng can...';

      var lc3 = ptData3.luanChi ? ptData3.luanChi[chiName] : null;
      if (lc3) {
        if ($('txtTuongConVat')) $('txtTuongConVat').textContent = lc3.tuongConVat || 'Tượng trưng con vật bản mệnh.';
        if ($('txtLuanChung')) $('txtLuanChung').textContent = lc3.luanChung || 'Luận đoán tổng quan tính cách.';
      }
    } catch (eTab3) {
      console.warn('Lỗi nạp Tab 3:', eTab3);
    }

    // E. KHỞI TẠO TAB 4 (Xem ngày Thông Thư & Hợp Tuổi)
    try {
      traCuuNgayThongThu();
    } catch (eTab4) {
      console.warn('Lỗi nạp Tab 4:', eTab4);
    }

    // F. KHỞI TẠO TAB 5 (Vợ chồng & Đẻ con)
    try {
      if (isNam) {
        if ($('txtNamChong')) $('txtNamChong').value = lunarYear;
        if ($('txtNamVo')) $('txtNamVo').value = lunarYear + 2;
      } else {
        if ($('txtNamChong')) $('txtNamChong').value = lunarYear - 2;
        if ($('txtNamVo')) $('txtNamVo').value = lunarYear;
      }

      // Tự động tính tuổi mụ của mẹ khi mang thai cho phần dự đoán giới tính con
      if ($('txtTuoiMe')) {
        var tuoiMeGoiY = 24;
        if (!isNam) {
          tuoiMeGoiY = tuoiMuNamXet;
        } else {
          var namV = $('txtNamVo') ? (parseInt($('txtNamVo').value, 10) || (lunarYear + 2)) : (lunarYear + 2);
          tuoiMeGoiY = namXetVal - namV + 1;
        }
        if (tuoiMeGoiY >= 18 && tuoiMeGoiY <= 40) {
          $('txtTuoiMe').value = tuoiMeGoiY;
        }
      }

      tinhTuoiVoChong();
      chayKeHoachSinhCon();
    } catch (eTab5) {
      console.warn('Lỗi nạp Tab 5:', eTab5);
    }

    // G. KHỞI TẠO TAB 4: TÍNH TRÙNG TANG (THEO BÁT TRẠCH TANG TẾ & SIM KINH DỊCH)
    try {
      chayTinhTrungTang();
    } catch (eTab6) {
      console.warn('Lỗi nạp Tab Trùng Tang:', eTab6);
    }

    // H. TỰ ĐỘNG QUÉT NGÀY ĐẸP HỢP TUỔI TRONG THÁNG
    try {
      chayQuetNgayDep();
    } catch (eQuet) {
      console.warn('Lỗi quét ngày đẹp:', eQuet);
    }

    // H.5. ĐỒNG BỘ LÁ SỐ TỬ VI ĐẨU SỐ (TAB 5) & LÁ SỐ BÁT TỰ - TỨ TRỤ (TAB 6)
    try {
      dongBoLaSoTuVi();
    } catch (eTuVi) {
      console.warn('Lỗi đồng bộ Tử Vi:', eTuVi);
    }

    try {
      if (root.BatTuTuTru && typeof root.BatTuTuTru.syncBaziFromAppInputs === 'function') {
        root.BatTuTuTru.syncBaziFromAppInputs();
      }
    } catch (eBatTu) {
      console.warn('Lỗi đồng bộ Bát Tự:', eBatTu);
    }

    // I. KẾT NỐI INTERNET WIKIPEDIA
    try {
      taiThongTinInternet(lunarYear, yData ? yData.mang : '');
    } catch (eWiki) {
      console.warn('Lỗi Internet Wiki:', eWiki);
    }

    // Cuộn mượt đến bảng kết quả nếu người dùng bấm tra cứu
    try {
      if ($('resultArea') && typeof $('resultArea').scrollIntoView === 'function') {
        $('resultArea').scrollIntoView({ behavior: 'smooth' });
      }
    } catch (eScroll) {}
  }

  // ==============================================================
  // TAB 4: TRA CỨU NGÀY THÔNG THƯ, SAO CHIẾU, NGÀY CON NƯỚC, SÁT CHỦ... & ĐỘ HỢP TUỔI
  // ==============================================================
  function traCuuNgayThongThu() {
    var sDate = $('dateXemNgay') ? $('dateXemNgay').value : '';
    var dObj = parseDate(sDate) || { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };

    var jdn = Lunar.jdFromDate(dObj.d, dObj.m, dObj.y);
    var lDate = Lunar.solar2Lunar(dObj.d, dObj.m, dObj.y);

    var canChiN = PT.getCanChiNgay(jdn);
    var canChiT = PT.getCanChiThang(lDate.month, lDate.year);
    var canChiY = PT.CAN[mod(lDate.year + 6, 10)] + ' ' + PT.CHI[mod(lDate.year + 8, 12)];
    var napAmN = LogicTT.getNapAm(canChiN.can, canChiN.chi);

    if ($('snDuong')) $('snDuong').textContent = pad(dObj.d) + '/' + pad(dObj.m) + '/' + dObj.y;
    if ($('snAm')) $('snAm').textContent = pad(lDate.day) + '/' + pad(lDate.month) + (lDate.leap ? ' Nhuận' : '') + '/' + lDate.year;
    if ($('snCanChiNgay')) $('snCanChiNgay').textContent = canChiN.ten + ' • Tháng ' + canChiT.ten + ' • Năm ' + canChiY;
    if ($('snNapAmNgay')) $('snNapAmNgay').textContent = napAmN.ten + ' • Hành ' + napAmN.hanh;

    // 12 Trực
    var truc = PT.getTrucNgay(lDate.month, canChiN.chi);
    if (truc && $('snTruc')) {
      var isTotTruc = (truc.tinhChat === 'Tốt');
      $('snTruc').className = 'badge ' + (isTotTruc ? 'good' : (truc.tinhChat === 'Xấu' ? 'bad' : 'gold'));
      $('snTruc').textContent = truc.ten + ' • ' + truc.tinhChat;
      if ($('snThoTruc')) {
        $('snThoTruc').innerHTML = truc.tho && truc.tho.length > 0 ? truc.tho.join('<br>') : truc.yNghia;
      }
    }

    // Ngày Hoàng Đạo / Hắc Đạo
    var hoangDao = PT.isNgayHoangDao(lDate.month, canChiN.chi);
    if ($('snHoangDao')) {
      $('snHoangDao').className = 'badge ' + (hoangDao ? 'gold' : 'bad');
      $('snHoangDao').textContent = hoangDao ? '✨ Ngày Hoàng Đạo' : 'Ngày Hắc Đạo';
    }

    // 28 Sao (Nhị thập bát tú)
    var sao28 = PT.getSao28(jdn);
    if (sao28 && $('snSao28')) {
      var isTotSao = (sao28.tinhChat === 'Tốt');
      $('snSao28').textContent = sao28.ten + ' • ' + (isTotSao ? 'Cát Tú' : 'Hung Tú');
      $('snSao28').style.color = isTotSao ? 'var(--good)' : 'var(--bad)';
      if ($('snDongVat')) $('snDongVat').textContent = sao28.dongVat;
      if ($('snThoSao')) $('snThoSao').innerHTML = sao28.tho ? sao28.tho.join('<br>') : '';
    }

    // Khổng Minh Lục Diệu
    var ld = PT.getLucDieuNgay(lDate.month, lDate.day);
    if (ld && $('snLucDieu')) {
      $('snLucDieu').textContent = ld.name + (ld.info ? ' • ' + ld.info.tinhChat : '');
      if ($('snLucDieuMoTa')) $('snLucDieuMoTa').textContent = ld.info ? ld.info.yNghia : 'Cát hung trong ngày.';
    }

    // Thần Sát Khổng Minh Xuất Hành (22 Sao từ Excel) & Hướng Xuất Hành
    var tsKM = PT.getThanSatXuatHanh(lDate.month, lDate.day);
    if (tsKM) {
      if ($('snThanSatKM')) {
        var tsCls = tsKM.danhGia.indexOf('Tốt') >= 0 ? '#6ee7b7' : '#fca5a5';
        $('snThanSatKM').innerHTML = '<span style="color:' + tsCls + ';">' + tsKM.ten + ' • ' + tsKM.danhGia + '</span>';
      }
      if ($('snThanSatKMYNghia')) $('snThanSatKMYNghia').textContent = tsKM.yNghia;
    }
    var hxh = PT.getHuongXuatHanh(canChiN.can);
    if ($('snHuongHyThan')) $('snHuongHyThan').textContent = hxh.hyThan;
    if ($('snHuongTaiThan')) $('snHuongTaiThan').textContent = hxh.taiThan;
    if ($('snHuongHacThan')) $('snHuongHacThan').textContent = hxh.hacThan;

    // Giờ Hoàng Đạo & Giờ Hắc Đạo
    var gList = PT.getGioHoangDao(canChiN.chi) || [];
    if ($('snGioHoangDao')) {
      $('snGioHoangDao').innerHTML = gList.map(function (g) {
        return '<span class="badge gold"><b>' + g.tenChi + '</b> • ' + g.khungGio + '</span>';
      }).join(' ');
    }

    var KHUNG_GIO_CHI = [
      '23:00 - 00:59', '01:00 - 02:59', '03:00 - 04:59', '05:00 - 06:59',
      '07:00 - 08:59', '09:00 - 10:59', '11:00 - 12:59', '13:00 - 14:59',
      '15:00 - 16:59', '17:00 - 18:59', '19:00 - 20:59', '21:00 - 22:59'
    ];
    if ($('snGioHacDao')) {
      var hacDaoArr = [];
      for (var c = 0; c < 12; c++) {
        var isHD = false;
        for (var k = 0; k < gList.length; k++) {
          if (gList[k].chiIdx === c) { isHD = true; break; }
        }
        if (!isHD) {
          hacDaoArr.push('<span class="badge bad"><b>' + PT.CHI[c] + '</b> • ' + KHUNG_GIO_CHI[c] + '</span>');
        }
      }
      $('snGioHacDao').innerHTML = hacDaoArr.join(' ');
    }

    // ==============================================================
    // A. BẢNG KIỂM TRA NGÀY KIÊNG KỴ ĐẶC BIỆT THEO SÁCH THÔNG THƯ NGỌC HẠP
    // ==============================================================
    var dacBiet = PT.kiemTraNgayDacBiet(lDate.month, lDate.day, canChiN.can, canChiN.chi);
    if (dacBiet) {
      // 1. Ngày Con Nước
      if ($('cardConNuoc')) $('cardConNuoc').className = 'alert-card' + (dacBiet.conNuoc.pham ? ' bad' : '');
      if ($('badgeConNuoc')) {
        $('badgeConNuoc').className = 'badge ' + (dacBiet.conNuoc.pham ? 'bad' : 'good');
        $('badgeConNuoc').textContent = dacBiet.conNuoc.pham ? 'PHẠM NGÀY CON NƯỚC' : 'Không phạm';
      }
      if ($('descConNuoc')) {
        var cnText = dacBiet.conNuoc.khuyenNghi;
        if (dacBiet.conNuoc.pham) {
          cnText += '<div style="margin-top:4px; font-size:0.83rem; color:var(--text-muted);"><em>"Tháng một, tháng bảy đầu sông; tháng hai, tháng tám giữa dòng chèo queo..."</em></div>';
        }
        $('descConNuoc').innerHTML = cnText;
      }

      // 2. Sát Chủ Dương
      if ($('cardSatChuDuong')) $('cardSatChuDuong').className = 'alert-card' + (dacBiet.satChuDuong.pham ? ' bad' : '');
      if ($('badgeSatChuDuong')) {
        $('badgeSatChuDuong').className = 'badge ' + (dacBiet.satChuDuong.pham ? 'bad' : 'good');
        $('badgeSatChuDuong').textContent = dacBiet.satChuDuong.pham ? 'PHẠM SÁT CHỦ DƯƠNG' : 'Không phạm';
      }
      if ($('descSatChuDuong')) $('descSatChuDuong').textContent = dacBiet.satChuDuong.khuyenNghi;

      // 3. Sát Chủ Âm
      if ($('cardSatChuAm')) $('cardSatChuAm').className = 'alert-card' + (dacBiet.satChuAm.pham ? ' bad' : '');
      if ($('badgeSatChuAm')) {
        $('badgeSatChuAm').className = 'badge ' + (dacBiet.satChuAm.pham ? 'bad' : 'good');
        $('badgeSatChuAm').textContent = dacBiet.satChuAm.pham ? 'PHẠM SÁT CHỦ ÂM' : 'Không phạm';
      }
      if ($('descSatChuAm')) $('descSatChuAm').textContent = dacBiet.satChuAm.khuyenNghi;

      // 4. Thụ Tử
      if ($('cardThuTu')) $('cardThuTu').className = 'alert-card' + (dacBiet.thuTu.pham ? ' bad' : '');
      if ($('badgeThuTu')) {
        $('badgeThuTu').className = 'badge ' + (dacBiet.thuTu.pham ? 'bad' : 'good');
        $('badgeThuTu').textContent = dacBiet.thuTu.pham ? 'PHẠM NGÀY THỤ TỬ' : 'Không phạm';
      }
      if ($('descThuTu')) $('descThuTu').textContent = dacBiet.thuTu.khuyenNghi;

      // 5. Tam Nương
      if ($('cardTamNuong')) $('cardTamNuong').className = 'alert-card' + (dacBiet.tamNuong.pham ? ' bad' : '');
      if ($('badgeTamNuong')) {
        $('badgeTamNuong').className = 'badge ' + (dacBiet.tamNuong.pham ? 'bad' : 'good');
        $('badgeTamNuong').textContent = dacBiet.tamNuong.pham ? 'PHẠM NGÀY TAM NƯƠNG' : 'Không phạm';
      }
      if ($('descTamNuong')) $('descTamNuong').textContent = dacBiet.tamNuong.khuyenNghi;

      // 6. Nguyệt Kỵ & Dương Công Kỵ Nhật
      var phamNK_DC = (dacBiet.nguyetKy && dacBiet.nguyetKy.pham) || (dacBiet.duongCong && dacBiet.duongCong.pham);
      if ($('cardNguyetKy')) $('cardNguyetKy').className = 'alert-card' + (phamNK_DC ? ' bad' : '');
      if ($('badgeNguyetKy')) {
        $('badgeNguyetKy').className = 'badge ' + (phamNK_DC ? 'bad' : 'good');
        $('badgeNguyetKy').textContent = phamNK_DC ? 'PHẠM ĐẠI KỴ' : 'Không phạm';
      }
      if ($('descNguyetKy')) {
        var strNk = [];
        if (dacBiet.nguyetKy && dacBiet.nguyetKy.pham) strNk.push(dacBiet.nguyetKy.khuyenNghi);
        if (dacBiet.duongCong && dacBiet.duongCong.pham) strNk.push(dacBiet.duongCong.khuyenNghi);
        if (strNk.length === 0) strNk.push('Không phạm ngày Nguyệt Kỵ hay Dương Công Kỵ Nhật.');
        $('descNguyetKy').innerHTML = strNk.join('<br>');
      }
    }

    // ==============================================================
    // B. CÁC SAO CHIẾU NGÀY THEO LỊCH VẠN SỰ (THOIGIAN.COM.VN & THÔNG THƯ NGỌC HẠP)
    // ==============================================================
    var saoThongThu = PT.getSaoChieuNgayThongThu(lDate.month, lDate.day, canChiN.can, canChiN.chi, lDate.year);
    if (saoThongThu) {
      if ($('lblCountCat')) $('lblCountCat').textContent = (saoThongThu.catTinh ? saoThongThu.catTinh.length : 0) + ' sao';
      if ($('snCatTinhList')) {
        if (saoThongThu.catTinh && saoThongThu.catTinh.length > 0) {
          $('snCatTinhList').innerHTML = saoThongThu.catTinh.map(function (s) {
            var detailHtml = '';
            if (s.tot) {
              detailHtml += '<div><strong style="color:#a7f3d0;">Tốt:</strong> ' + s.tot + '</div>';
            }
            if (s.ky) {
              detailHtml += '<div style="margin-top:2px;"><strong style="color:#fca5a5;">Kỵ:</strong> ' + s.ky + '</div>';
            }
            if (s.ghiChu) {
              detailHtml += '<div style="margin-top:2px; font-style:italic; color:#94a3b8;">Ghi chú: ' + s.ghiChu + '</div>';
            }
            if (!detailHtml) {
              detailHtml = s.yNghia || s.loiKhuyen || 'Sao tốt chiếu mệnh.';
            }
            return '<div class="star-card cat">' +
              '<div class="star-name">★ ' + s.ten + '</div>' +
              '<div class="star-desc">' + detailHtml + '</div>' +
              '</div>';
          }).join('');
        } else {
          $('snCatTinhList').innerHTML = '<div class="subtext" style="grid-column:1/-1;">Không có cát tinh đặc biệt chiếu hôm nay.</div>';
        }
      }

      if ($('lblCountHung')) $('lblCountHung').textContent = (saoThongThu.hungTinh ? saoThongThu.hungTinh.length : 0) + ' sao';
      if ($('snHungTinhList')) {
        if (saoThongThu.hungTinh && saoThongThu.hungTinh.length > 0) {
          $('snHungTinhList').innerHTML = saoThongThu.hungTinh.map(function (s) {
            var detailHtml = '';
            if (s.ky) {
              detailHtml += '<div><strong style="color:#fecaca;">Kỵ:</strong> ' + s.ky + '</div>';
            }
            if (s.ghiChu) {
              detailHtml += '<div style="margin-top:2px; font-style:italic; color:#cbd5e1;">Ghi chú: ' + s.ghiChu + '</div>';
            }
            if (!detailHtml) {
              detailHtml = s.yNghia || s.loiKhuyen || 'Sao xấu cần kiêng cữ.';
            }
            return '<div class="star-card hung">' +
              '<div class="star-name">✦ ' + s.ten + '</div>' +
              '<div class="star-desc">' + detailHtml + '</div>' +
              '</div>';
          }).join('');
        } else {
          $('snHungTinhList').innerHTML = '<div class="subtext" style="grid-column:1/-1; color:var(--good);">Hôm nay thanh bình, không có hung tinh lớn chiếu!</div>';
        }
      }
    }

    // ==============================================================
    // C. VIỆC NÊN & VIỆC KIÊNG CỮ TỔNG HỢP THEO THÔNG THƯ
    // ==============================================================
    var dsNen = [];
    var dsKieng = [];

    if (truc && truc.yNghia) dsNen.push(truc.yNghia);
    if (saoThongThu && saoThongThu.catTinh) {
      for (var ct = 0; ct < Math.min(3, saoThongThu.catTinh.length); ct++) {
        dsNen.push(saoThongThu.catTinh[ct].ten + ': ' + (saoThongThu.catTinh[ct].yNghia || ''));
      }
    }
    if ($('snViecNen')) {
      $('snViecNen').innerHTML = dsNen.length > 0 ? dsNen.join('<br>• ') : 'Làm các công việc thường nhật, xuất hành nhẹ nhàng, thiện nguyện cầu an.';
    }

    if (dacBiet) {
      if (dacBiet.conNuoc.pham) dsKieng.push('Phạm Con Nước: Kiêng xuất hành, đi thuyền bè qua sông lớn, việc đại sự.');
      if (dacBiet.satChuDuong.pham) dsKieng.push('Phạm Sát Chủ Dương: Kiêng khởi công, xây cất, cưới gả, nhậm chức.');
      if (dacBiet.satChuAm.pham) dsKieng.push('Phạm Sát Chủ Âm: Đại kỵ khâm liệm, an táng, cải táng, việc âm phần.');
      if (dacBiet.thuTu.pham) dsKieng.push('Phạm Thụ Tử: Bách sự đều kỵ, chớ nên khởi sự bất cứ việc lớn nào.');
      if (dacBiet.tamNuong.pham) dsKieng.push('Phạm Tam Nương: Kiêng giá thú, khai trương, ký kết hợp đồng.');
      if (dacBiet.nguyetKy.pham) dsKieng.push('Phạm Nguyệt Kỵ: Mùng năm, mười bốn, hai ba đi chơi còn lỗ nữa là đi buôn.');
      if (dacBiet.duongCong.pham) dsKieng.push('Phạm Dương Công Kỵ Nhật: Ngày đại kỵ trăm sự, nên an phận.');
    }
    if (saoThongThu && saoThongThu.hungTinh) {
      for (var ht = 0; ht < Math.min(4, saoThongThu.hungTinh.length); ht++) {
        dsKieng.push('Sao ' + saoThongThu.hungTinh[ht].ten + ' (' + (saoThongThu.hungTinh[ht].ky || saoThongThu.hungTinh[ht].yNghia || '') + ')');
      }
    }
    if (sao28 && sao28.tinhChat === 'Xấu') {
      dsKieng.push('Sao ' + sao28.ten + ' xấu: kiêng mở hàng, khởi công, cưới hỏi, chôn cất, đề phòng tranh chấp.');
    }
    if (dsKieng.length === 0) {
      dsKieng.push('Tránh các khung giờ Hắc Đạo; chú ý giữ gìn lời ăn tiếng nói, cẩn trọng tiền bạc.');
    }
    if ($('snViecKieng')) {
      $('snViecKieng').innerHTML = dsKieng.join('<br>• ');
    }

    // ==============================================================
    // D. ĐÁNH GIÁ ĐỘ HỢP VỚI ĐƯƠNG SỐ
    // ==============================================================
    var duongSo = {
      can: currentCanIndex,
      chi: currentChiIndex,
      hanh: currentNapAmHanh
    };
    var dg = LogicTT.danhGiaNgayVoiDuongSo(canChiN, napAmN, duongSo);

    if ($('lblXepLoaiNgay')) $('lblXepLoaiNgay').textContent = dg.xepLoai;
    if ($('lblDiemNgay')) $('lblDiemNgay').textContent = dg.diem + '/100';
    if ($('lblDuongSoName')) {
      $('lblDuongSoName').textContent = 'Đương số tuổi ' + PT.CAN[currentCanIndex] + ' ' + PT.CHI[currentChiIndex] + ' • ' + (currentYearData ? currentYearData.mang : currentNapAmHanh);
    }

    var boxScore = $('boxScoreNgay');
    if (boxScore) {
      if (dg.diem < 50) {
        boxScore.className = 'score-box bad';
      } else {
        boxScore.className = 'score-box';
      }
    }

    if ($('listTuongHop') && dg.chiTiet) {
      $('listTuongHop').innerHTML = dg.chiTiet.map(function (item) {
        var badgeCls = item.loai === 'tot' ? 'good' : (item.loai === 'xau' ? 'bad' : 'gold');
        return '<div style="padding:10px 14px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-left:4px solid ' + (item.loai === 'tot' ? 'var(--good)' : (item.loai === 'xau' ? 'var(--bad)' : 'var(--gold)')) + ';">' +
          '<div style="font-weight:700;"><span class="badge ' + badgeCls + '" style="margin-right:6px;">' + item.tieuDe + '</span></div>' +
          '<div class="subtext" style="margin-top:4px;">' + item.moTa + '</div>' +
          '</div>';
      }).join('');
    }

    // ==============================================================
    // E. KHUYẾN NGHỊ KHỞI SỰ CÁC HẠNG MỤC CÔNG VIỆC (PHONG THỦY THIÊN MINH)
    // ==============================================================
    if ($('boxKhuyenNghiThienMinh')) {
      var tTen = truc ? truc.ten : '';
      var s28Tot = (sao28 && sao28.tinhChat === 'Tốt');
      var s28Xau = (sao28 && sao28.tinhChat === 'Xấu');
      var isHD = hoangDao;
      var ldTot = (ld && (ld.name === 'Tốc Hỷ' || ld.name === 'Đại An' || ld.name === 'Tiểu Cát'));
      var ldXau = (ld && (ld.name === 'Không Vong' || ld.name === 'Xích Khẩu'));
      var tsKMTot = (tsKM && tsKM.danhGia && tsKM.danhGia.indexOf('Tốt') >= 0);

      var hangMuc = [
        {
          id: 'lamnha',
          ten: 'Động Thổ, Làm Nhà',
          icon: '🏡',
          danhGia: function () {
            var uu = [], ky = [];
            if (dacBiet && dacBiet.satChuDuong && dacBiet.satChuDuong.pham) ky.push('Phạm Sát Chủ Dương (đại kỵ cất nóc, động thổ)');
            if (dacBiet && dacBiet.thuTu && dacBiet.thuTu.pham) ky.push('Phạm Thụ Tử (trăm sự đều kỵ)');
            if (dacBiet && dacBiet.tamNuong && dacBiet.tamNuong.pham) ky.push('Phạm Tam Nương');
            if (dacBiet && dacBiet.duongCong && dacBiet.duongCong.pham) ky.push('Phạm Dương Công Kỵ Nhật');
            if (dg && dg.isLucXung) ky.push('Chi ngày chính xung tuổi gia chủ');
            if (dg && dg.isThienKhacDiaXung) ky.push('Thiên Khắc Địa Xung với bản mệnh');
            if (tTen === 'Phá' || tTen === 'Bế' || tTen === 'Nguy') ky.push('Trực ' + tTen + ' bất lợi xây dựng');
            if (s28Xau) ky.push((sao28 ? sao28.ten : 'Sao') + ' hung tú');

            if (isHD) uu.push('Ngày Hoàng Đạo vượng khí');
            if (['Kiến', 'Khai', 'Bình', 'Định', 'Thành', 'Mãn'].indexOf(tTen) >= 0) uu.push('Trực ' + tTen + ' cát lành');
            if (s28Tot) uu.push((sao28 ? sao28.ten : 'Sao') + ' cát tú');
            if (dg && (dg.isTamHop || dg.isLucHop)) uu.push('Hợp tuổi gia chủ (' + (dg.isTamHop ? 'Tam Hợp' : 'Lục Hợp') + ')');

            var status = 'trung', badge = 'Bình Hòa', cls = 'gold';
            if (ky.length >= 2 || (dacBiet && dacBiet.satChuDuong && dacBiet.satChuDuong.pham) || (dacBiet && dacBiet.thuTu && dacBiet.thuTu.pham) || (dg && dg.isLucXung)) {
              status = 'xau'; badge = 'Đại Kỵ • Tránh Làm'; cls = 'bad';
            } else if (uu.length >= 2 && ky.length === 0) {
              status = 'tot'; badge = 'Đại Cát • Khuyên Dùng'; cls = 'good';
            }
            return {
              status: status, badge: badge, cls: cls,
              lyDo: ky.length > 0 ? ('⚠️ ' + ky.join('; ')) : ('★ ' + uu.join('; '))
            };
          }
        },
        {
          id: 'cuoihoi',
          ten: 'Cưới Hỏi, Đính Hôn',
          icon: '💍',
          danhGia: function () {
            var uu = [], ky = [];
            if (dacBiet && dacBiet.tamNuong && dacBiet.tamNuong.pham) ky.push('Phạm Tam Nương (kỵ giá thú trăm năm)');
            if (dacBiet && dacBiet.nguyetKy && dacBiet.nguyetKy.pham) ky.push('Phạm Nguyệt Kỵ');
            if (dacBiet && dacBiet.satChuDuong && dacBiet.satChuDuong.pham) ky.push('Phạm Sát Chủ');
            if (dacBiet && dacBiet.thuTu && dacBiet.thuTu.pham) ky.push('Phạm Thụ Tử');
            if (dg && dg.isLucXung) ky.push('Chính xung tuổi đương số');
            if (['Phá', 'Bế', 'Nguy', 'Thu'].indexOf(tTen) >= 0) ky.push('Trực ' + tTen + ' không lợi kết hôn');
            if (s28Xau) ky.push((sao28 ? sao28.ten : 'Sao') + ' hung');

            if (isHD) uu.push('Ngày Hoàng Đạo');
            if (['Định', 'Thành', 'Khai', 'Mãn'].indexOf(tTen) >= 0) uu.push('Trực ' + tTen + ' đại lợi trăm năm');
            if (s28Tot) uu.push((sao28 ? sao28.ten : 'Sao') + ' cát tinh');
            if (dg && (dg.isTamHop || dg.isLucHop)) uu.push('Can Chi hòa hợp tuổi chủ');

            var status = 'trung', badge = 'Bình Hòa', cls = 'gold';
            if (ky.length >= 2 || (dacBiet && dacBiet.tamNuong && dacBiet.tamNuong.pham) || (dacBiet && dacBiet.nguyetKy && dacBiet.nguyetKy.pham) || (dg && dg.isLucXung)) {
              status = 'xau'; badge = 'Đại Kỵ • Tránh Làm'; cls = 'bad';
            } else if (uu.length >= 2 && ky.length === 0) {
              status = 'tot'; badge = 'Cát Lành • Rất Tốt'; cls = 'good';
            }
            return {
              status: status, badge: badge, cls: cls,
              lyDo: ky.length > 0 ? ('⚠️ ' + ky.join('; ')) : ('★ ' + uu.join('; '))
            };
          }
        },
        {
          id: 'khaitruong',
          ten: 'Khai Trương, Ký Hợp Đồng',
          icon: '🎉',
          danhGia: function () {
            var uu = [], ky = [];
            if (dacBiet && dacBiet.nguyetKy && dacBiet.nguyetKy.pham) ky.push('Phạm Nguyệt Kỵ (kỵ buôn bán, mở tiệm)');
            if (dacBiet && dacBiet.tamNuong && dacBiet.tamNuong.pham) ky.push('Phạm Tam Nương');
            if (dacBiet && ((dacBiet.satChuDuong && dacBiet.satChuDuong.pham) || (dacBiet.thuTu && dacBiet.thuTu.pham))) ky.push('Phạm Sát Chủ / Thụ Tử');
            if (dg && dg.isLucXung) ky.push('Chính xung tuổi');
            if (tTen === 'Phá' || tTen === 'Bế' || tTen === 'Nguy') ky.push('Trực ' + tTen + ' trắc trở kinh doanh');

            if (isHD) uu.push('Hoàng Đạo hanh thông');
            if (['Khai', 'Mãn', 'Thành', 'Định'].indexOf(tTen) >= 0) uu.push('Trực ' + tTen + ' đón tài lộc');
            if (ldTot) uu.push('Lục Diệu: ' + (ld ? ld.name : '') + ' cát lợi');
            if (s28Tot) uu.push((sao28 ? sao28.ten : 'Sao') + ' đắc tài');

            var status = 'trung', badge = 'Bình Hòa', cls = 'gold';
            if (ky.length >= 2 || (dacBiet && dacBiet.nguyetKy && dacBiet.nguyetKy.pham) || (dg && dg.isLucXung)) {
              status = 'xau'; badge = 'Đại Kỵ • Tránh Mở'; cls = 'bad';
            } else if (uu.length >= 2 && ky.length === 0) {
              status = 'tot'; badge = 'Đại Cát • Khuyên Dùng'; cls = 'good';
            }
            return {
              status: status, badge: badge, cls: cls,
              lyDo: ky.length > 0 ? ('⚠️ ' + ky.join('; ')) : ('★ ' + uu.join('; '))
            };
          }
        },
        {
          id: 'xuathanh',
          ten: 'Xuất Hành, Đi Xa, Du Lịch',
          icon: '🚗',
          danhGia: function () {
            var uu = [], ky = [];
            if (dacBiet && dacBiet.conNuoc && dacBiet.conNuoc.pham) ky.push('Phạm Con Nước (rất kỵ sông nước, đi xa)');
            if (dacBiet && ((dacBiet.thuTu && dacBiet.thuTu.pham) || (dacBiet.duongCong && dacBiet.duongCong.pham))) ky.push('Phạm Thụ Tử / Dương Công');
            if (dacBiet && dacBiet.tamNuong && dacBiet.tamNuong.pham) ky.push('Phạm Tam Nương');
            if (ldXau) ky.push('Lục Diệu: ' + (ld ? ld.name : '') + ' trắc trở');
            if (tsKM && tsKM.danhGia && tsKM.danhGia.indexOf('Xấu') >= 0) ky.push('Thần Sát: ' + tsKM.ten + ' (' + tsKM.danhGia + ')');

            if (ldTot) uu.push('Lục Diệu: ' + (ld ? ld.name : '') + ' bình an');
            if (tsKMTot) uu.push('Thần Sát: ' + (tsKM ? tsKM.ten : '') + ' hanh thông');
            if (['Khai', 'Mãn', 'Định', 'Kiến'].indexOf(tTen) >= 0) uu.push('Trực ' + tTen + ' thuận lợi');
            if (hxh && hxh.hyThan) uu.push('Hỷ Thần: Hướng ' + hxh.hyThan);
            if (hxh && hxh.taiThan) uu.push('Tài Thần: Hướng ' + hxh.taiThan);

            var status = 'trung', badge = 'Bình Hòa', cls = 'gold';
            if ((dacBiet && dacBiet.conNuoc && dacBiet.conNuoc.pham) || ky.length >= 2 || (tsKM && tsKM.danhGia && tsKM.danhGia.indexOf('Xấu') >= 0 && ldXau)) {
              status = 'xau'; badge = 'Đại Kỵ • Tránh Đi'; cls = 'bad';
            } else if (uu.length >= 2 && ky.length === 0) {
              status = 'tot'; badge = 'Cát Lành • Bình An'; cls = 'good';
            }
            return {
              status: status, badge: badge, cls: cls,
              lyDo: ky.length > 0 ? ('⚠️ ' + ky.join('; ')) : ('★ ' + uu.join('; '))
            };
          }
        },
        {
          id: 'giaodich',
          ten: 'Giao Dịch, Mua Xe, Tài Chính',
          icon: '💼',
          danhGia: function () {
            var uu = [], ky = [];
            if (!isHD) ky.push('Ngày Hắc Đạo');
            if (dacBiet && dacBiet.nguyetKy && dacBiet.nguyetKy.pham) ky.push('Phạm Nguyệt Kỵ');
            if (dacBiet && dacBiet.thuTu && dacBiet.thuTu.pham) ky.push('Phạm Thụ Tử');
            if (dg && dg.isLucXung) ky.push('Chính xung tuổi');
            if (tTen === 'Phá' || tTen === 'Bế') ky.push('Trực ' + tTen + ' bất lợi khế ước');

            if (isHD) uu.push('Hoàng Đạo quý khí');
            if (['Khai', 'Thu', 'Thành', 'Mãn', 'Định'].indexOf(tTen) >= 0) uu.push('Trực ' + tTen + ' thu tài nạp phúc');
            if (dg && dg.diem >= 70) uu.push('Hợp bản mệnh ' + dg.diem + 'đ');
            if (ldTot) uu.push('Lục Diệu: ' + (ld ? ld.name : ''));

            var status = 'trung', badge = 'Bình Hòa', cls = 'gold';
            if (ky.length >= 2 || (dg && dg.isLucXung) || (dacBiet && dacBiet.thuTu && dacBiet.thuTu.pham)) {
              status = 'xau'; badge = 'Đại Kỵ • Tránh Ký'; cls = 'bad';
            } else if (uu.length >= 2 && ky.length === 0) {
              status = 'tot'; badge = 'Đại Cát • Thuận Lợi'; cls = 'good';
            }
            return {
              status: status, badge: badge, cls: cls,
              lyDo: ky.length > 0 ? ('⚠️ ' + ky.join('; ')) : ('★ ' + uu.join('; '))
            };
          }
        },
        {
          id: 'antang',
          ten: 'Tế Tự, An Táng, Việc Âm Phần',
          icon: '⚰️',
          danhGia: function () {
            var uu = [], ky = [];
            if (dacBiet && dacBiet.satChuAm && dacBiet.satChuAm.pham) ky.push('PHẠM SÁT CHỦ ÂM (tuyệt đối cấm kỵ an táng)');
            if (dacBiet && dacBiet.thuTu && dacBiet.thuTu.pham) ky.push('Phạm Thụ Tử');
            if (tTen === 'Khai' || tTen === 'Kiến') ky.push('Trực ' + tTen + ' chủ hưng dương, không hợp táng sự');

            if (tTen === 'Trừ' || tTen === 'Định' || tTen === 'Nguy') uu.push('Trực ' + tTen + ' trừ uế nghinh phúc, táng cát');
            if (dacBiet && dacBiet.satChuAm && !dacBiet.satChuAm.pham) uu.push('Không phạm Sát Chủ Âm');
            if (isHD) uu.push('Hoàng Đạo thanh bình');

            var status = 'trung', badge = 'Bình Hòa', cls = 'gold';
            if ((dacBiet && dacBiet.satChuAm && dacBiet.satChuAm.pham) || (dacBiet && dacBiet.thuTu && dacBiet.thuTu.pham)) {
              status = 'xau'; badge = 'Đại Kỵ • Cấm Kỵ'; cls = 'bad';
            } else if (uu.length >= 2 && ky.length === 0) {
              status = 'tot'; badge = 'Cát Lành • An Lành'; cls = 'good';
            }
            return {
              status: status, badge: badge, cls: cls,
              lyDo: ky.length > 0 ? ('⚠️ ' + ky.join('; ')) : ('★ ' + uu.join('; '))
            };
          }
        }
      ];

      $('boxKhuyenNghiThienMinh').innerHTML = hangMuc.map(function (item) {
        var resHM = item.danhGia();
        var borderLeftColor = resHM.status === 'tot' ? 'var(--good)' : (resHM.status === 'xau' ? 'var(--bad)' : 'var(--gold)');
        var bgAlpha = resHM.status === 'tot' ? 'rgba(16, 185, 129, 0.06)' : (resHM.status === 'xau' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)');

        return '<div style="padding:12px 14px; border-radius:8px; background:' + bgAlpha + '; border:1px solid var(--border); border-left:4px solid ' + borderLeftColor + ';">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
            '<span style="font-weight:700; font-size:0.95rem; color:#f8fafc;">' + item.icon + ' ' + item.ten + '</span>' +
            '<span class="badge ' + resHM.cls + '" style="font-size:0.75rem;">' + resHM.badge + '</span>' +
          '</div>' +
          '<div style="font-size:0.83rem; line-height:1.5; color:#cbd5e1;">' + resHM.lyDo + '</div>' +
        '</div>';
      }).join('');
    }
  }

  // ==============================================================
  // TAB 3: QUÉT & LỌC NGÀY ĐẸP HỢP BẢN MỆNH THEO MỤC ĐÍCH CÔNG VIỆC
  // ==============================================================
  function chayQuetNgayDep() {
    var mucDich = $('selMucDichViec') ? $('selMucDichViec').value : 'all';
    var thang = $('selThangLoc') ? parseInt($('selThangLoc').value, 10) : (today.getMonth() + 1);
    var nam = $('txtNamLoc') ? (parseInt($('txtNamLoc').value, 10) || today.getFullYear()) : today.getFullYear();

    var duongSo = {
      can: currentCanIndex,
      chi: currentChiIndex,
      hanh: currentNapAmHanh
    };

    var res = LogicTT.timNgayDepHopTuoi(duongSo, nam, thang, mucDich);
    if (!res) return;

    if ($('boxKetQuaQuetNgay')) $('boxKetQuaQuetNgay').style.display = 'block';

    if ($('lblTieuDeQuetNgay')) {
      $('lblTieuDeQuetNgay').textContent = 'Danh Sách Ngày Đẹp Hợp Tuổi Tháng ' + thang + '/' + nam + ' • ' + res.tenMucDich;
    }

    if ($('badgeThongKeNgayDep')) {
      $('badgeThongKeNgayDep').className = 'badge ' + (res.soNgayDep > 0 ? 'good' : 'gold');
      $('badgeThongKeNgayDep').textContent = 'Có ' + res.soNgayDep + '/' + res.tongNgay + ' ngày cát lành hợp bản mệnh';
    }

    if ($('tblDanhSachNgayDep')) {
      $('tblDanhSachNgayDep').innerHTML = res.danhSach.map(function (item) {
        var clsRow = item.laNgayDep ? 'style="background:rgba(16, 185, 129, 0.08);"' : '';
        return '<tr ' + clsRow + '>' +
          '<td><strong>' + item.ngayDuong + '</strong></td>' +
          '<td>' + item.ngayAm + '</td>' +
          '<td><b style="color:var(--gold);">' + item.canChiNgay + '</b><br><small class="subtext">' + item.napAmNgay + '</small></td>' +
          '<td><span class="badge ' + item.cls + '">' + item.diem + 'đ • ' + item.xepLoai + '</span></td>' +
          '<td>' + (item.hoangDao ? '<span class="badge gold" style="font-size:0.75rem;">Hoàng Đạo</span>' : '<span class="badge bad" style="font-size:0.75rem;">Hắc Đạo</span>') + ' ' + (item.truc ? '<span class="badge" style="font-size:0.75rem;">Trực ' + item.truc + '</span>' : '') + '</td>' +
          '<td style="font-size:0.86rem; line-height:1.55;">' +
            '<div style="color:#6ee7b7;">★ ' + (item.uuDiem || 'Thuận lợi') + '</div>' +
            (item.canhBao !== 'Không phạm ngày kỵ lớn' ? ('<div style="color:#fca5a5; font-size:0.8rem; margin-top:3px;">⚠️ ' + item.canhBao + '</div>') : '') +
          '</td>' +
          '<td style="font-size:0.82rem; color:#cbd5e1;">' + (item.gioHoangDao || 'Đang cập nhật') + '</td>' +
          '<td style="text-align:center;">' +
            '<button type="button" class="btn-sm" data-date="' + item.dateKey + '">Chi Tiết ↗</button>' +
          '</td>' +
          '</tr>';
      }).join('');

      // Gắn sự kiện click cho các nút Xem Chi Tiết từng ngày
      var btns = queryAll('#tblDanhSachNgayDep button.btn-sm');
      for (var b = 0; b < btns.length; b++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            var targetDate = btn.getAttribute('data-date');
            if ($('dateXemNgay')) $('dateXemNgay').value = targetDate;
            traCuuNgayThongThu();
            if ($('boxChiTietNgayArea') && typeof $('boxChiTietNgayArea').scrollIntoView === 'function') {
              $('boxChiTietNgayArea').scrollIntoView({ behavior: 'smooth' });
            }
          });
        })(btns[b]);
      }
    }
  }

  // ==============================================================
  // TAB 5: TRA CỨU TUỔI VỢ CHỒNG
  // ==============================================================
  function tinhTuoiVoChong() {
    var namC = $('txtNamChong') ? parseInt($('txtNamChong').value, 10) : 2003;
    var namV = $('txtNamVo') ? parseInt($('txtNamVo').value, 10) : 2005;
    if (!namC || !namV) return;

    var curNamXet = $('namXet') ? (parseInt($('namXet').value, 10) || 2026) : 2026;
    var tMeCalc = curNamXet - namV + 1;
    if ($('txtTuoiMe') && tMeCalc >= 18 && tMeCalc <= 40) {
      $('txtTuoiMe').value = tMeCalc;
    }

    var dataC = PT.getTuoiData(namC);
    var dataV = PT.getTuoiData(namV);

    var cungC = dataC ? dataC.cungNam.replace(/\s*\(.*\)/g, '').trim() : 'Càn';
    var cungV = dataV ? dataV.cungNu.replace(/\s*\(.*\)/g, '').trim() : 'Khôn';
    var mangC = dataC ? dataC.mang : LogicTT.getNapAm(mod(namC + 6, 10), mod(namC + 8, 12)).ten;
    var mangV = dataV ? dataV.mang : LogicTT.getNapAm(mod(namV + 6, 10), mod(namV + 8, 12)).ten;

    var key = cungC + '-' + cungV;
    var ptData = PT.getPhongThuyData();
    var match = ptData.cungVoChong ? ptData.cungVoChong[key] : null;

    if ($('resVoChong')) $('resVoChong').style.display = 'block';

    if (match) {
      var isGood = (match.batTrach === 'Sinh khí' || match.batTrach === 'Diên niên' || match.batTrach === 'Thiên Y' || match.batTrach === 'Phục vị');
      var colorClass = isGood ? 'var(--good)' : 'var(--bad)';
      if ($('vcKetQua')) {
        $('vcKetQua').innerHTML = 'Chồng ' + (dataC ? dataC.canChi : namC) + ' • Cung ' + cungC + ' phối Vợ ' + (dataV ? dataV.canChi : namV) + ' • Cung ' + cungV + ': <span style="color:' + colorClass + ';">' + match.batTrach + ' • ' + (isGood ? 'Đại Cát' : 'Cần Hóa Giải') + '</span>';
      }
      
      var qhMenh = getQuanHeMenh(mangC, mangV);
      if ($('vcChiTiet')) {
        $('vcChiTiet').innerHTML = 
          '<p><strong>Mệnh Nạp Âm:</strong> Chồng ' + mangC + ' • Vợ ' + mangV + ' -> ' + qhMenh + '</p>' +
          '<p><strong>Địa Chi:</strong> Chồng ' + (dataC ? dataC.chi : '') + ' • Vợ ' + (dataV ? dataV.chi : '') + '</p>';
      }

      if ($('vcTho')) {
        $('vcTho').innerHTML = (match.tho && match.tho.length > 0) ? match.tho.join('<br>') : 'Không có bài thơ ghi chú.';
      }
    } else {
      if ($('vcKetQua')) {
        $('vcKetQua').innerHTML = 'Chồng ' + cungC + ' phối Vợ ' + cungV + ': Cung phối bình hòa';
      }
      if ($('vcChiTiet')) {
        $('vcChiTiet').innerHTML = '<p><strong>Mệnh Nạp Âm:</strong> Chồng ' + mangC + ' • Vợ ' + mangV + ' -> ' + getQuanHeMenh(mangC, mangV) + '</p>';
      }
      if ($('vcTho')) $('vcTho').innerHTML = 'Vợ chồng hòa thuận, tích đức hành thiện sẽ đắc tài lộc.';
    }
  }

  // ==============================================================
  // TAB 5: KẾ HOẠCH ĐẺ CON 10 NĂM TỚI
  // ==============================================================
  function chayKeHoachSinhCon() {
    var namC = $('txtNamChong') ? (parseInt($('txtNamChong').value, 10) || 2003) : 2003;
    var namV = $('txtNamVo') ? (parseInt($('txtNamVo').value, 10) || 2005) : 2005;

    var danhSach = LogicTT.tinhKeHoachSinhCon(namC, namV);
    if ($('boxBangSinhCon')) $('boxBangSinhCon').style.display = 'block';

    if ($('tblKeHoachCon') && danhSach) {
      $('tblKeHoachCon').innerHTML = danhSach.map(function (n) {
        var badgeCls = n.diem >= 16 ? 'good' : (n.diem >= 13 ? 'good' : (n.diem >= 10 ? 'gold' : 'bad'));
        return '<tr>' +
          '<td><strong>' + n.nam + '</strong></td>' +
          '<td><b>' + n.canChi + '</b> • ' + n.conGiap + '</td>' +
          '<td>' + n.napAm + '</td>' +
          '<td><span class="badge ' + badgeCls + '">' + n.diem + '/20đ</span></td>' +
          '<td><strong>' + n.danhGia + '</strong></td>' +
          '<td class="subtext">' + n.ghiChu + '</td>' +
          '</tr>';
      }).join('');
    }
  }

  // ==============================================================
  // TAB 5: TRA CON GÌ (Phật, Trời, Người, Ta, Ma, Quỷ)
  // ==============================================================
  function traConGi() {
    var meChi = $('selMeChi') ? $('selMeChi').value : 'Mùi';
    var thang = $('selThangThu') ? $('selThangThu').value : '1';

    var ptData = PT.getPhongThuyData();
    var conName = (ptData.traConBang && ptData.traConBang[meChi]) ? ptData.traConBang[meChi][thang] : 'Trời';
    var detail = ptData.yNghiaCon ? ptData.yNghiaCon[conName] : null;

    if ($('resTraCon')) $('resTraCon').style.display = 'block';
    if ($('lblConGi')) $('lblConGi').textContent = 'Mẹ tuổi ' + meChi + ' thụ thai tháng ' + thang + ' ÂL: ' + (detail ? detail.ten : ('Con ' + conName));
    if (detail) {
      if ($('descConGi')) $('descConGi').textContent = detail.tinhCach;
      if ($('thoConGi')) $('thoConGi').innerHTML = detail.tho ? detail.tho.join('<br>') : '';
    }
  }

  // ==============================================================
  // TAB 5: DỰ ĐOÁN TRAI GÁI (Cung đình cổ truyền 18-40 tuổi)
  // ==============================================================
  function traTraiGai() {
    var tuoiMe = $('txtTuoiMe') ? parseInt($('txtTuoiMe').value, 10) : 25;
    var thang = $('selThangThu2') ? $('selThangThu2').value : '1';

    if (isNaN(tuoiMe) || tuoiMe < 18 || tuoiMe > 40) {
      alert('Vui lòng nhập tuổi mụ của mẹ từ 18 đến 40 tuổi theo bảng cung đình.');
      return;
    }

    var ptData = PT.getPhongThuyData();
    var gt = (ptData.traiGaiBang && ptData.traiGaiBang[String(tuoiMe)]) ? ptData.traiGaiBang[String(tuoiMe)][thang] : 'Trai';

    if ($('resTraiGai')) $('resTraiGai').style.display = 'block';
    if (gt === 'Trai') {
      if ($('iconTraiGai')) $('iconTraiGai').textContent = '👦';
      if ($('lblTraiGai')) $('lblTraiGai').innerHTML = 'Dự đoán: <span style="color:var(--primary);">CON TRAI</span>';
    } else {
      if ($('iconTraiGai')) $('iconTraiGai').textContent = '👧';
      if ($('lblTraiGai')) $('lblTraiGai').innerHTML = 'Dự đoán: <span style="color:var(--gold);">CON GÁI</span>';
    }
  }

  // ==============================================================
  // TAB 6: TÍNH TRÙNG TANG - THIÊN DI - NHẬP MỘ (SIM KINH DỊCH & BÁT TRẠCH TANG TẾ)
  // ==============================================================
  function chayTinhTrungTang() {
    var ns = $('tangNamSinh') ? (parseInt($('tangNamSinh').value, 10) || 1948) : 1948;
    var nc = $('tangNamChet') ? (parseInt($('tangNamChet').value, 10) || 2026) : 2026;
    var tc = $('tangThangChet') ? (parseInt($('tangThangChet').value, 10) || 2) : 2;
    var ng = $('tangNgayChet') ? (parseInt($('tangNgayChet').value, 10) || 7) : 7;
    var gc = $('tangGioChet') ? parseInt($('tangGioChet').value, 10) : 6;
    if (isNaN(gc)) gc = 6;
    var gt = $('tangGioiTinh') ? $('tangGioiTinh').value : 'nam';
    var hoTen = ($('tangHoTen') && $('tangHoTen').value) ? $('tangHoTen').value.trim() : '';

    var res = LogicTT.tinhTrungTang(ns, nc, tc, ng, gc, gt, hoTen);
    if (!res) return;

    // A. Thẻ Tiêu Đề Người Mất
    if ($('ttTieuDeNguoiMat')) {
      var tenStr = hoTen ? ('Hương linh: ' + hoTen + ' • ') : '';
      var gtStr = (gt === 'nam') ? 'Nam giới • Khởi Dần tiến thuận' : 'Nữ giới • Khởi Thân nghịch thoái';
      var danhXungTho = (res.tuoiMu >= 60) ? 'Hưởng thọ' : 'Hưởng dương';
      $('ttTieuDeNguoiMat').textContent = tenStr + gtStr + ' • ' + danhXungTho + ' ' + res.tuoiMu + ' tuổi mụ (Năm mất ' + nc + ' - Năm sinh ' + ns + ' + 1)';
    }

    if ($('ttThongTinChiTiet')) {
      $('ttThongTinChiTiet').textContent = 
        'Năm sinh: ' + res.canChiNamSinh + ' • ' + ns + ' • Mất: Ngày ' + ng + ' tháng ' + tc + ' năm ' + res.canChiNamChet + ' • ' + nc + ' • Giờ ' + res.cungGio.chi;
    }

    // B. Cập nhật 4 Cung Cát Hung (Năm, Tháng, Ngày, Giờ)
    function renderCung(cungObj, idChi, idBadge, idDanhGia, loaiCung) {
      if ($(idChi)) $(idChi).textContent = 'Cung ' + cungObj.chi;
      if ($(idBadge)) {
        var cls = cungObj.ketQua === 'Nhập Mộ' ? 'badge good' : (cungObj.ketQua === 'Trùng Tang' ? 'badge bad' : 'badge');
        $(idBadge).className = cls;
        $(idBadge).textContent = cungObj.ketQua;
      }
      if ($(idDanhGia)) {
        var subText = '';
        if (cungObj.ketQua === 'Nhập Mộ') subText = 'Tốt • Cát Lành';
        else if (cungObj.ketQua === 'Thiên Di') subText = 'Bình Hòa • Thuận Lẽ Trời';
        else subText = 'Xấu • Trùng ' + loaiCung;
        $(idDanhGia).textContent = subText;
      }
    }

    renderCung(res.cungNam, 'ttCungNam', 'ttBadgeNam', 'ttDanhGiaNam', 'Năm');
    renderCung(res.cungThang, 'ttCungThang', 'ttBadgeThang', 'ttDanhGiaThang', 'Tháng');
    renderCung(res.cungNgay, 'ttCungNgay', 'ttBadgeNgay', 'ttDanhGiaNgay', 'Ngày');
    renderCung(res.cungGio, 'ttCungGio', 'ttBadgeGio', 'ttDanhGiaGio', 'Giờ');

    // C. Kết Luận & Luận Giải Chuẩn Sim Kinh Dịch
    if ($('ttKetLuan')) {
      $('ttKetLuan').textContent = res.ketLuan;
      $('ttKetLuan').style.color = (res.statusClass === 'good') ? 'var(--good)' : ((res.statusClass === 'bad') ? 'var(--bad)' : 'var(--gold)');
    }

    if ($('ttChiTiet')) {
      $('ttChiTiet').textContent = res.chiTiet;
    }

    // D. Kiểm Tra Thần Trùng
    if ($('ttPhamThanTrung')) {
      if (res.phamThanTrung) {
        $('ttPhamThanTrung').className = 'badge bad';
        $('ttPhamThanTrung').textContent = 'Phạm Thần Trùng • Ngày ' + res.cungNgay.chi + ' phạm Thần Trùng tháng ' + tc;
      } else {
        $('ttPhamThanTrung').className = 'badge good';
        $('ttPhamThanTrung').textContent = 'Không phạm Thần Trùng • Cát Lành';
      }
    }

    // E. Chi Tiết Cấp Độ Trùng
    if ($('ttChiTietCapDo')) {
      var summaryText = 'Tổng quan bốn cung: ' + res.countMo + ' Nhập Mộ • ' + res.countDi + ' Thiên Di • ' + res.countTrung + ' Trùng Tang';
      if (res.chiTietTrung && res.chiTietTrung.length > 0) {
        summaryText += ' • ' + res.chiTietTrung.join(', ');
      }
      $('ttChiTietCapDo').textContent = summaryText;
    }

    // F. Bài Thơ Tang Sự Ca Quyết Excel Sheet Test
    if ($('ttPoemName')) {
      $('ttPoemName').textContent = res.poem ? res.poem.ten : 'Ca quyết tang sự';
    }
    if ($('ttPoemText')) {
      $('ttPoemText').innerHTML = (res.poem && res.poem.tho) ? res.poem.tho.join('<br>') : '';
    }
  }

  // ==============================================================
  // TÍCH HỢP WIKIPEDIA & MỞ RỘNG INTERNET
  // ==============================================================
  function taiThongTinInternet(lunarYear, mangStr) {
    var box = $('extContent');
    if (!box) return;
    box.innerHTML = '<em>Đang kết nối thư viện tri thức Wikipedia tiếng Việt...</em>';

    var p1 = fetch('https://vi.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(String(lunarYear)))
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });

    var cleanMang = mangStr ? mangStr.split('–')[0].replace(/\(.*?\)/g, '').trim() : '';
    var p2 = cleanMang ? fetch('https://vi.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(cleanMang))
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; }) : Promise.resolve(null);

    Promise.all([p1, p2]).then(function (results) {
      var html = '';
      if (results[0] && results[0].extract) {
        html += '<div style="margin-bottom:12px;"><strong>Sự kiện lịch sử năm ' + lunarYear + ' (Wikipedia):</strong><br>' +
          results[0].extract + ' <a href="' + results[0].content_urls.desktop.page + '" target="_blank" rel="noopener">Xem chi tiết trên Wikipedia ↗</a></div>';
      }
      if (results[1] && results[1].extract) {
        html += '<div><strong>Khái niệm nạp âm ' + cleanMang + ' (Wikipedia):</strong><br>' +
          results[1].extract + ' <a href="' + results[1].content_urls.desktop.page + '" target="_blank" rel="noopener">Xem chi tiết ↗</a></div>';
      }
      if (!html) {
        html = '<p>Ứng dụng đang hoạt động ở chế độ ngoại tuyến (Offline). Toàn bộ dữ liệu phong thủy Bát Trạch, Sách Thông Thư Ngọc Hạp, Bát Tự và Trùng Tang đã được tích hợp đầy đủ 100%.</p>';
      }
      box.innerHTML = html;
    }).catch(function () {
      box.innerHTML = '<p>Ứng dụng đang hoạt động ở chế độ ngoại tuyến (Offline). Toàn bộ dữ liệu phong thủy đã sẵn sàng.</p>';
    });
  }

  // Export các hàm ra window để truy cập từ bất cứ đâu
  root.traCuuToanDien = traCuuToanDien;
  root.tinhTuoiVoChong = tinhTuoiVoChong;
  root.chayKeHoachSinhCon = chayKeHoachSinhCon;
  root.traCuuNgayThongThu = traCuuNgayThongThu;
  root.traConGi = traConGi;
  root.traTraiGai = traTraiGai;
  root.chayTinhTrungTang = chayTinhTrungTang;
  root.chayQuetNgayDep = chayQuetNgayDep;

  // Tự động chạy lần đầu với giá trị mặc định khi trang tải xong
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', traCuuToanDien);
    window.addEventListener('load', traCuuToanDien);
  } else {
    traCuuToanDien();
  }
})(typeof window !== 'undefined' ? window : globalThis);
