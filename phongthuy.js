/**
 * phongthuy.js - Bộ vi xử lý phong thủy, tử vi, can chi, sách Thông Thư
 * Dựa trên thuật toán Hồ Ngọc Đức và cơ sở dữ liệu từ file Thông Thư
 */
(function (root) {
  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var CON_GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];
  var CON_ICON = ['🐭', '🐮', '🐯', '🐱', '🐲', '🐍', '🐴', '🐐', '🐵', '🐔', '🐶', '🐷'];

  var TAM_HOP_CHI = {
    0: [8, 0, 4],   // Thân - Tý - Thìn
    1: [5, 9, 1],   // Tỵ - Dậu - Sửu
    2: [2, 6, 10],  // Dần - Ngọ - Tuất
    3: [11, 3, 7]   // Hợi - Mão - Mùi
  };
  // 3 năm tam tai ứng với 4 nhóm
  var TAM_TAI_YEARS = {
    0: [2, 3, 4],   // Dần - Mão - Thìn
    1: [11, 0, 1],  // Hợi - Tý - Sửu
    2: [8, 9, 10],  // Thân - Dậu - Tuất
    3: [5, 6, 7]    // Tỵ - Ngọ - Mùi
  };

  var LUC_XUNG = { 0: 6, 1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 0, 7: 1, 8: 2, 9: 3, 10: 4, 11: 5 };
  var LUC_HAI = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 0, 8: 11, 9: 10, 10: 9, 11: 8 };
  var LUC_PHA = { 0: 9, 1: 4, 2: 11, 3: 6, 4: 1, 5: 8, 6: 3, 7: 10, 8: 5, 9: 0, 10: 7, 11: 2 };
  var LUC_HOP = { 0: 1, 1: 0, 2: 11, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2 };
  var TU_HINH = [0, 3, 6, 9]; // hoặc các cặp tự hình

  function mod(a, n) { return ((a % n) + n) % n; }

  // Can chi ngày theo Julian Day Number
  function getCanChiNgay(jdn) {
    var can = mod(jdn + 9, 10);
    var chi = mod(jdn + 1, 12);
    return { can: can, chi: chi, tenCan: CAN[can], tenChi: CHI[chi], ten: CAN[can] + ' ' + CHI[chi] };
  }

  // Can chi tháng âm lịch
  function getCanChiThang(lunarMonth, lunarYear) {
    var canNam = mod(lunarYear + 6, 10);
    // Giáp Kỷ khởi Bính Dần (tháng 1 là Dần)
    var canThang1 = (canNam * 2 + 1) % 10;
    var can = (canThang1 + lunarMonth - 1) % 10;
    var chi = mod(lunarMonth + 1, 12); // tháng 1 là Dần (index 2)
    return { can: can, chi: chi, tenCan: CAN[can], tenChi: CHI[chi], ten: CAN[can] + ' ' + CHI[chi] };
  }

  // Can chi giờ
  function getCanChiGio(gioIndex, canNgay) {
    var canGioTy = (canNgay * 2) % 10;
    var can = (canGioTy + gioIndex) % 10;
    return { can: can, chi: gioIndex, tenCan: CAN[can], tenChi: CHI[gioIndex], ten: CAN[can] + ' ' + CHI[gioIndex] };
  }

  // Khổng Minh Lục Diệu
  var LUC_DIEU_NAMES = ['Đại An', 'Lưu Niên', 'Tốc Hỷ', 'Xích Khẩu', 'Tiểu Cát', 'Không Vong'];
  function getLucDieuNgay(lunarMonth, lunarDay) {
    var idx = (lunarMonth - 1 + lunarDay - 1) % 6;
    var name = LUC_DIEU_NAMES[idx];
    var data = window.DATA_PHONGTHUY ? window.DATA_PHONGTHUY.lucDieu[name] : null;
    return { name: name, info: data };
  }
  function getLucDieuGio(lunarMonth, lunarDay, gioChiIndex) {
    var startDayIdx = (lunarMonth - 1 + lunarDay - 1) % 6;
    var gioIdx = (startDayIdx + gioChiIndex) % 6;
    var name = LUC_DIEU_NAMES[gioIdx];
    var data = window.DATA_PHONGTHUY ? window.DATA_PHONGTHUY.lucDieu[name] : null;
    return { name: name, info: data };
  }

  // 12 Trực: Tháng âm có chi tháng (tháng 1 là Dần), ngày có chi Dần là trực Kiến
  var THO_12_TRUC = [
    ['Kiến là vạn sự khởi đầu hay,', 'Động thổ làm nhà phát đạt ngay.', 'Xuất hành giá thú thêm con cháu,', 'Khai trương đại cát lộc tràn đầy.'],
    ['Trừ là trừ bỏ vận tai ương,', 'Trị bệnh cầu an giải đoạn trường.', 'Tống cựu nghinh tân điều tốt đẹp,', 'Khởi công xuất ngoại đặng hanh thông.'],
    ['Mãn là viên mãn phúc lộc gia,', 'Cầu tài tạ lễ vượng cửa nhà.', 'Khởi công tạo tác thêm vinh hiển,', 'Kiêng cữ chôn cất kẻo can qua.'],
    ['Bình là bình định việc cân phân,', 'Tu sửa san phẳng khắp xa gần.', 'Hôn nhân xuất ngoại việc bình ổn,', 'Giữ gìn hòa khí chớ phân vân.'],
    ['Định là an định việc trăm năm,', 'Đính hôn cưới hỏi đức sánh tằm.', 'Làm nhà buôn bán ngàn đời thịnh,', 'Giao kết bạn hiền rạng tiếng tăm.'],
    ['Chấp là nắm giữ mối giềng xưa,', 'Xây đắp nền móng chẳng quản mưa.', 'Bắt trộm trừ gian đắc thắng lợi,', 'Kiêng dời chuyển chỗ, xuất hành thưa.'],
    ['Phá là hao tán việc chẳng lành,', 'Động thổ cưới xin sự khó thành.', 'Kiêng kỵ khai trương cầu tài lộc,', 'Chỉ nên phá dỡ giải thị phi.'],
    ['Nguy là hiểm trở chớ coi khinh,', 'Đi thuyền leo núi nhớ giữ mình.', 'Mưu việc lớn lao nên tạm hoãn,', 'Tu thân tích đức đợi an ninh.'],
    ['Thành là tác sự việc đều thông,', 'Hôn thú khai trương phúc trùng trùng.', 'Nhập trạch thăng quan thêm điền sản,', 'Trăm năm sự nghiệp thỏa ước mong.'],
    ['Thâu là thâu nạp của tiền kho,', 'Thu nợ gặt mùa chẳng âu lo.', 'Mua sắm gia tài tăng thịnh vượng,', 'Tránh việc an táng kẻo phiền to.'],
    ['Khai là mở cửa đón quang vinh,', 'Khai trương nhậm chức rạng bình minh.', 'Hôn nhân giá thú duyên cầm sắt,', 'Động thổ khởi công đắc thái bình.'],
    ['Bế là bế tắc cửa âm dương,', 'Đắp đập vá hang việc kiên cường.', 'Kiêng việc mở mang thông cống rãnh,', 'Cưới xin chôn cất chuốc tai ương.']
  ];

  function getTrucNgay(lunarMonth, dayChi) {
    var thangChi = mod(lunarMonth + 1, 12); // Tháng 1 âm là Dần (2)
    var diff = mod(dayChi - thangChi, 12);
    if (window.DATA_PHONGTHUY && window.DATA_PHONGTHUY.truc12) {
      var item = window.DATA_PHONGTHUY.truc12[diff];
      if (item) {
        return {
          ten: item.ten,
          tinhChat: item.tinhChat,
          yNghia: item.yNghia,
          tho: THO_12_TRUC[diff] || []
        };
      }
    }
    return null;
  }

  // 28 Sao Nhị Thập Bát Tú
  // Ngày 01/01/1970 là Thứ Năm (JDN 2440588). 
  // Bảng 28 sao bắt đầu từ Sao Giác (index 0).
  // Chu kỳ 28 ngày: JDN % 28
  // Kiểm tra hiệu chỉnh để khớp với ngày lịch
  function getSao28(jdn) {
    if (!window.DATA_PHONGTHUY || !window.DATA_PHONGTHUY.sao28) return null;
    // Công thức chuẩn Nhị thập bát tú theo JDN: (jdn + 11) % 28 (khớp sao ngày)
    var idx = mod(jdn + 11, 28);
    return window.DATA_PHONGTHUY.sao28[idx];
  }

  // Giờ Hoàng Đạo trong ngày theo Chi ngày
  var HOANG_DAO_GIO_MAP = {
    // Dần, Thân: Tý, Sửu, Thìn, Tỵ, Mùi, Tuất
    2: [0, 1, 4, 5, 7, 10], 8: [0, 1, 4, 5, 7, 10],
    // Mão, Dậu: Tý, Dần, Mão, Ngọ, Mùi, Dậu
    3: [0, 2, 3, 6, 7, 9], 9: [0, 2, 3, 6, 7, 9],
    // Thìn, Tuất: Dần, Thìn, Tỵ, Thân, Dậu, Hợi
    4: [2, 4, 5, 8, 9, 11], 10: [2, 4, 5, 8, 9, 11],
    // Tỵ, Hợi: Sửu, Thìn, Ngọ, Mùi, Tuất, Hợi
    5: [1, 4, 6, 7, 10, 11], 11: [1, 4, 6, 7, 10, 11],
    // Tý, Ngọ: Tý, Sửu, Mão, Ngọ, Thân, Dậu
    0: [0, 1, 3, 6, 8, 9], 6: [0, 1, 3, 6, 8, 9],
    // Sửu, Mùi: Dần, Mão, Tỵ, Thân, Tuất, Hợi
    1: [2, 3, 5, 8, 10, 11], 7: [2, 3, 5, 8, 10, 11]
  };

  function getGioHoangDao(dayChi) {
    var arr = HOANG_DAO_GIO_MAP[dayChi] || [];
    return arr.map(function (idx) {
      return { chi: idx, tenChi: CHI[idx], khungGio: getKhungGio(idx) };
    });
  }

  function getKhungGio(chiIndex) {
    var start = (chiIndex * 2 + 23) % 24;
    var end = (chiIndex * 2 + 1) % 24;
    var s = (start < 10 ? '0' : '') + start + ':00';
    var e = (end < 10 ? '0' : '') + end + ':59';
    return s + ' - ' + e;
  }

  // Ngày Hoàng Đạo / Hắc Đạo
  // Dựa theo tháng và chi ngày
  var HOANG_DAO_NGAY = {
    // Tháng 1, 7: Tý, Sửu, Tỵ, Mùi là Hoàng Đạo
    1: [0, 1, 4, 5, 7, 10], 7: [0, 1, 4, 5, 7, 10],
    2: [2, 3, 6, 7, 9, 0], 8: [2, 3, 6, 7, 9, 0],
    3: [4, 5, 8, 9, 11, 2], 9: [4, 5, 8, 9, 11, 2],
    4: [6, 7, 10, 11, 1, 4], 10: [6, 7, 10, 11, 1, 4],
    5: [8, 9, 0, 1, 3, 6], 11: [8, 9, 0, 1, 3, 6],
    6: [10, 11, 2, 3, 5, 8], 12: [10, 11, 2, 3, 5, 8]
  };

  function isNgayHoangDao(lunarMonth, dayChi) {
    var arr = HOANG_DAO_NGAY[lunarMonth] || [];
    return arr.indexOf(dayChi) >= 0;
  }

  // Tra cứu Thái Tuế
  function kiemTraThaiTue(chiTuoi, chiNamXet) {
    var res = [];
    if (chiTuoi === chiNamXet) {
      res.push({ loai: 'Trực Thái Tuế • Năm bản mệnh', moTa: 'Năm bản mệnh, tâm trạng dễ biến động, việc làm ăn cần thận trọng, tránh đầu tư mạo hiểm.' });
    }
    if (LUC_XUNG[chiTuoi] === chiNamXet) {
      res.push({ loai: 'Xung Thái Tuế', moTa: 'Lục xung với năm, biến động mạnh mẽ, dễ có sự thay đổi về nhà cửa, công việc, xuất hành xa.' });
    }
    if (LUC_HAI[chiTuoi] === chiNamXet) {
      res.push({ loai: 'Hại Thái Tuế', moTa: 'Dễ gặp tiểu nhân quấy phá, thị phi điều tiếng, quan hệ bạn bè đối tác cần lưu tâm.' });
    }
    if (LUC_PHA[chiTuoi] === chiNamXet) {
      res.push({ loai: 'Phá Thái Tuế', moTa: 'Đề phòng hao tài tốn của, công việc đổ bể giữa chừng, hợp tác làm ăn cần kỹ lưỡng giấy tờ.' });
    }
    if (TU_HINH.indexOf(chiTuoi) >= 0 && chiTuoi === chiNamXet) {
      res.push({ loai: 'Hình Thái Tuế • Tự hình', moTa: 'Dễ tự gây áp lực cho bản thân, sức khỏe và tinh thần cần chú ý bồi dưỡng.' });
    }
    return res;
  }

  // Tra cứu Tam Tai
  function kiemTraTamTai(chiTuoi, chiNamXet) {
    for (var g = 0; g < 4; g++) {
      if (TAM_HOP_CHI[g].indexOf(chiTuoi) >= 0) {
        var idx = TAM_TAI_YEARS[g].indexOf(chiNamXet);
        if (idx >= 0) {
          var namThu = idx + 1; // 1, 2, hoặc 3
          return {
            pham: true,
            namThu: namThu,
            moTa: 'Phạm Tam Tai năm thứ ' + namThu + (namThu === 2 ? ' (năm nặng nhất trong 3 năm tam tai)' : '')
          };
        }
      }
    }
    return { pham: false, namThu: 0, moTa: 'Không phạm Tam Tai' };
  }

  // Lấy dữ liệu đầy đủ từ data_tuoi.js
  function getTuoiData(lunarYear) {
    if (window.DATA_TUOI && window.DATA_TUOI[String(lunarYear)]) {
      return window.DATA_TUOI[String(lunarYear)];
    }
    return null;
  }

  // Lấy dữ liệu phong thủy tổng hợp
  function getPhongThuyData() {
    return window.DATA_PHONGTHUY || {};
  }

  // KIỂM TRA CÁC NGÀY KIÊNG KỴ ĐẶC BIỆT CỦA SÁCH THÔNG THƯ
  // Bao gồm: Ngày Con Nước, Sát Chủ Dương, Sát Chủ Âm, Thụ Tử, Tam Nương, Nguyệt Kỵ, Dương Công Kỵ Nhật
  function kiemTraNgayDacBiet(lunarMonth, lunarDay, canNgay, chiNgay) {
    // 1. Ngày Con Nước
    var CON_NUOC_MAP = {
      1: [5, 19], 7: [5, 19],
      2: [3, 17, 29], 8: [3, 17, 29],
      3: [9, 23], 9: [9, 23],
      4: [7, 21], 10: [7, 21],
      5: [5, 19], 11: [5, 19],
      6: [3, 17, 29], 12: [3, 17, 29]
    };
    var daysCn = CON_NUOC_MAP[lunarMonth] || [];
    var phamConNuoc = daysCn.indexOf(lunarDay) >= 0;

    // 2. Ngày Sát Chủ Dương (kỵ việc dương trần: làm nhà, cưới hỏi, khai trương, xuất hành)
    var SAT_CHU_DUONG = {
      1: 5, 2: 0, 3: 7, 4: 3, 5: 8, 6: 10, 7: 1, 8: 11, 9: 6, 10: 9, 11: 2, 12: 4
    };
    var chiScDuong = SAT_CHU_DUONG[lunarMonth];
    var phamScDuong = (chiNgay === chiScDuong);

    // 3. Ngày Sát Chủ Âm (kỵ việc âm phần: an táng, chôn cất, cải táng, xây mộ)
    var SAT_CHU_AM = {
      1: 2, 2: 8, 3: 3, 4: 9, 5: 4, 6: 10, 7: 5, 8: 11, 9: 0, 10: 6, 11: 1, 12: 7
    };
    var chiScAm = SAT_CHU_AM[lunarMonth];
    var phamScAm = (chiNgay === chiScAm);

    // 4. Ngày Thụ Tử (Thọ Tử - Trăm sự đều kỵ)
    var THU_TU = {
      1: 10, 2: 4, 3: 11, 4: 5, 5: 0, 6: 6, 7: 1, 8: 7, 9: 2, 10: 8, 11: 3, 12: 9
    };
    var chiThuTu = THU_TU[lunarMonth];
    var phamThuTu = (chiNgay === chiThuTu);

    // 5. Ngày Tam Nương (mùng 3, 7, 13, 18, 22, 27)
    var TAM_NUONG = [3, 7, 13, 18, 22, 27];
    var phamTamNuong = TAM_NUONG.indexOf(lunarDay) >= 0;

    // 6. Ngày Nguyệt Kỵ (mùng 5, 14, 23)
    var NGUYET_KY = [5, 14, 23];
    var phamNguyetKy = NGUYET_KY.indexOf(lunarDay) >= 0;

    // 7. Ngày Dương Công Kỵ Nhật (13 ngày đại kỵ trong năm)
    var DUONG_CONG = {
      1: [13], 2: [11], 3: [9], 4: [7], 5: [5], 6: [3],
      7: [8, 29], 8: [27], 9: [25], 10: [23], 11: [21], 12: [19]
    };
    var daysDc = DUONG_CONG[lunarMonth] || [];
    var phamDuongCong = daysDc.indexOf(lunarDay) >= 0;

    return {
      conNuoc: {
        pham: phamConNuoc,
        ngayCuaThang: daysCn.join(', '),
        caQuyet: 'Dù ai buôn bán trăm bề / Nhớ ngày con nước chèo bè về không.',
        khuyenNghi: phamConNuoc ? 'Hôm nay là Ngày Con Nước! Kiêng xuất hành xa, đi đò bè đường thủy, buôn bán ký kết hợp đồng, mở cửa hàng, động thổ làm nhà.' : 'Hôm nay không phạm ngày Con Nước.'
      },
      satChuDuong: {
        pham: phamScDuong,
        chiPham: CHI[chiScDuong],
        khuyenNghi: phamScDuong ? 'Hôm nay là ngày Sát Chủ Dương (ngày ' + CHI[chiScDuong] + ')! Đại kỵ việc dương trần: làm nhà, cưới hỏi, khai trương, xuất hành, cất nóc.' : 'Không phạm ngày Sát Chủ Dương.'
      },
      satChuAm: {
        pham: phamScAm,
        chiPham: CHI[chiScAm],
        khuyenNghi: phamScAm ? 'Hôm nay là ngày Sát Chủ Âm (ngày ' + CHI[chiScAm] + ')! Đại kỵ việc âm phần: tang tế, an táng, chôn cất, cải táng, xây đắp mồ mả.' : 'Không phạm ngày Sát Chủ Âm.'
      },
      thuTu: {
        pham: phamThuTu,
        chiPham: CHI[chiThuTu],
        khuyenNghi: phamThuTu ? 'Hôm nay là ngày Thụ Tử (Thọ Tử - ngày ' + CHI[chiThuTu] + ')! Trăm sự đều kỵ, vạn việc chớ nên khởi sự.' : 'Không phạm ngày Thụ Tử.'
      },
      tamNuong: {
        pham: phamTamNuong,
        khuyenNghi: phamTamNuong ? 'Hôm nay là ngày Tam Nương (mùng ' + lunarDay + ')! Cổ nhân khuyên nên cẩn trọng, kiêng khởi công, cưới hỏi, xuất hành xa.' : 'Không phạm ngày Tam Nương.'
      },
      nguyetKy: {
        pham: phamNguyetKy,
        khuyenNghi: phamNguyetKy ? 'Hôm nay là ngày Nguyệt Kỵ (mùng ' + lunarDay + ' - Mùng năm, mười bốn, hai ba)! Tránh đi xa, buôn bán lớn hay xuất vốn đầu tư.' : 'Không phạm ngày Nguyệt Kỵ.'
      },
      duongCong: {
        pham: phamDuongCong,
        khuyenNghi: phamDuongCong ? 'Hôm nay là ngày Dương Công Kỵ Nhật (ngày ' + lunarDay + ' tháng ' + lunarMonth + ')! Một trong 13 ngày đại hung trong năm, nên an phận thủ thường.' : 'Không phạm ngày Dương Công Kỵ Nhật.'
      }
    };
  }

  // TÍNH TOÁN CÁC SAO CHIẾU NGÀY HÔM ẤY THEO LỊCH VẠN SỰ (THOIGIAN.COM.VN & THÔNG THƯ NGỌC HẠP)
  // Bao gồm đầy đủ 51 Cát tinh và 59 Sát tinh (Hung tinh)
  function getSaoChieuNgayThongThu(lunarMonth, lunarDay, canNgay, chiNgay, lunarYear) {
    var m = lunarMonth; // 1..12
    var mIdx = m - 1;   // 0..11
    var d = lunarDay;   // 1..30
    var cc = CAN[canNgay] + ' ' + CHI[chiNgay];
    var mMod6 = m % 6;  // 1: M1,7; 2: M2,8; 3: M3,9; 4: M4,10; 5: M5,11; 0: M6,12
    var mua = Math.floor((m - 1) / 3); // 0: Xuân(1-3), 1: Hạ(4-6), 2: Thu(7-9), 3: Đông(10-12)
    var chiThang = mod(m + 1, 12);

    var catTinh = [];
    var hungTinh = [];

    function addCat(ten, tot, ky, ghiChu) {
      var desc = 'Tốt: ' + tot;
      if (ky) desc += ' • Kỵ: ' + ky;
      if (ghiChu) desc += ' (' + ghiChu + ')';
      catTinh.push({
        ten: ten,
        loai: 'Cát Tinh',
        tot: tot || '',
        ky: ky || '',
        ghiChu: ghiChu || '',
        yNghia: desc
      });
    }

    function addHung(ten, ky, ghiChu) {
      var desc = 'Kỵ: ' + ky;
      if (ghiChu) desc += ' (' + ghiChu + ')';
      hungTinh.push({
        ten: ten,
        loai: 'Hung Tinh',
        ky: ky || '',
        ghiChu: ghiChu || '',
        yNghia: desc
      });
    }

    // ==============================================================
    // I. 51 CÁT TINH (SAO TỐT)
    // ==============================================================

    // 1. Thiên đức
    var TD_CAN = { 1: 3, 3: 8, 4: 7, 6: 0, 7: 9, 9: 2, 10: 1, 12: 6 };
    var TD_CHI = { 2: 8, 5: 11, 8: 2, 11: 5 };
    if ((TD_CAN[m] !== undefined && canNgay === TD_CAN[m]) ||
        (TD_CHI[m] !== undefined && chiNgay === TD_CHI[m])) {
      addCat('Thiên đức', 'Đại cát', '');
    }

    // 2. Thiên đức hợp
    var TDH_CAN = { 1: 8, 3: 3, 4: 2, 6: 5, 7: 4, 9: 7, 10: 6, 12: 1 };
    var TDH_CHI = { 2: 5, 5: 2, 8: 11, 11: 8 };
    if ((TDH_CAN[m] !== undefined && canNgay === TDH_CAN[m]) ||
        (TDH_CHI[m] !== undefined && chiNgay === TDH_CHI[m])) {
      addCat('Thiên đức hợp', 'Đại cát', '');
    }

    // 3. Nguyệt đức
    var ND_CAN = [2, 0, 8, 6, 2, 0, 8, 6, 2, 0, 8, 6];
    if (canNgay === ND_CAN[mIdx]) {
      addCat('Nguyệt đức', 'Đại cát', '');
    }

    // 4. Nguyệt đức hợp
    var NDH_CAN = [7, 5, 3, 1, 7, 5, 3, 1, 7, 5, 3, 1];
    if (canNgay === NDH_CAN[mIdx]) {
      addCat('Nguyệt đức hợp', 'Đại cát', 'Tố tụng');
    }

    // 5. Thiên hỷ
    if (chiNgay === mod(m + 9, 12)) {
      addCat('Thiên hỷ', 'Tốt, nhất là giá thú', '');
    }

    // 6. Nguyệt ân
    var NGUYET_AN_CAN = [2, 3, 6, 5, 4, 7, 8, 9, 6, 1, 0, 7];
    if (canNgay === NGUYET_AN_CAN[mIdx]) {
      addCat('Nguyệt ân', 'Đại cát', '');
    }

    // 7. Nguyệt không
    var NGUYET_KHONG_CAN = [8, 6, 2, 0, 8, 6, 2, 0, 8, 6, 2, 0];
    if (canNgay === NGUYET_KHONG_CAN[mIdx]) {
      addCat('Nguyệt không', 'Sửa nhà, làm giường', '');
    }

    // 8. Thiên phú
    if (chiNgay === mod(m + 3, 12)) {
      addCat('Thiên phú', 'Xây dựng, khai trương, an táng', '');
    }

    // 9. Thiên thành
    var THIEN_THANH_CHI = [7, 9, 11, 1, 3, 5, 7, 9, 11, 1, 3, 5];
    if (chiNgay === THIEN_THANH_CHI[mIdx]) {
      addCat('Thiên thành', 'Tốt', '');
    }

    // 10. Thiên quan
    var THIEN_QUAN_CHI = [10, 0, 2, 4, 6, 8, 10, 0, 2, 4, 6, 8];
    if (chiNgay === THIEN_QUAN_CHI[mIdx]) {
      addCat('Thiên quan', 'Tốt', '');
    }

    // 11. Thiên mã
    var THIEN_MA_CHI = [6, 8, 10, 0, 2, 4, 6, 8, 10, 0, 2, 4];
    if (chiNgay === THIEN_MA_CHI[mIdx]) {
      addCat('Thiên mã', 'Xuất hành, giao dịch, cầu tài lộc', 'Động thổ, mai táng');
    }

    // 12. Thiên tài
    var THIEN_TAI_CHI = [4, 6, 8, 10, 0, 2, 4, 6, 8, 10, 0, 2];
    if (chiNgay === THIEN_TAI_CHI[mIdx]) {
      addCat('Thiên tài', 'Cầu tài, khai trương', '');
    }

    // 13. Địa tài
    var DIA_TAI_CHI = [5, 7, 9, 11, 1, 3, 5, 7, 9, 11, 1, 3];
    if (chiNgay === DIA_TAI_CHI[mIdx]) {
      addCat('Địa tài', 'Cầu tài, khai trương', '');
    }

    // 14. Nguyệt tài
    var NGUYET_TAI_CHI = [6, 5, 5, 7, 9, 11, 6, 5, 5, 7, 9, 11];
    if (chiNgay === NGUYET_TAI_CHI[mIdx]) {
      addCat('Nguyệt tài', 'Cầu tài, khai trương, xuất hành, di chuyển, giao dịch', '');
    }

    // 15. Lộc khố
    if (chiNgay === mod(m + 3, 12)) {
      addCat('Lộc khố', 'Cầu tài, khai trương, giao dịch', '');
    }

    // 16. Phúc sinh
    var PHUC_SINH_CHI = [9, 3, 10, 4, 11, 5, 0, 6, 1, 7, 2, 8];
    if (chiNgay === PHUC_SINH_CHI[mIdx]) {
      addCat('Phúc sinh', 'Tốt', '');
    }

    // 17. Phúc hậu
    var PHUC_HAU_CHI = [2, 2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11];
    if (chiNgay === PHUC_HAU_CHI[mIdx]) {
      addCat('Phúc hậu', 'Khai trương, tài lộc', '');
    }

    // 18. Âm đức
    var AM_DUC_CHI = [9, 7, 5, 3, 1, 11, 9, 7, 5, 3, 1, 11];
    if (chiNgay === AM_DUC_CHI[mIdx]) {
      addCat('Âm đức', 'Tốt', '');
    }

    // 19. Cát khánh
    var CAT_KHANH_CHI = [9, 2, 11, 4, 1, 6, 3, 8, 5, 10, 7, 0];
    if (chiNgay === CAT_KHANH_CHI[mIdx]) {
      addCat('Cát khánh', 'Tốt', '');
    }

    // 20. Hoạt diệu
    var HOAT_DIEU_CHI = [5, 10, 7, 0, 9, 2, 11, 4, 1, 6, 3, 8];
    if (chiNgay === HOAT_DIEU_CHI[mIdx]) {
      addCat('Hoạt diệu', 'Tốt', 'Thụ tử');
    }

    // 21. Mãn đức tinh
    var MAN_DUC_CHI = [2, 7, 4, 9, 6, 11, 8, 1, 10, 3, 0, 5];
    if (chiNgay === MAN_DUC_CHI[mIdx]) {
      addCat('Mãn đức tinh', 'Tốt', '');
    }

    // 22. U vi tinh
    var U_VI_CHI = [11, 4, 1, 6, 3, 8, 5, 10, 7, 0, 9, 2];
    if (chiNgay === U_VI_CHI[mIdx]) {
      addCat('U vi tinh', 'Tốt', '');
    }

    // 23. Kính tâm
    var KINH_TAM_CHI = [7, 1, 8, 2, 9, 3, 10, 4, 11, 5, 0, 6];
    if (chiNgay === KINH_TAM_CHI[mIdx]) {
      addCat('Kính tâm', 'Tốt với tang tế', '');
    }

    // 24. Thánh tâm
    var THANH_TAM_CHI = [11, 5, 0, 6, 1, 7, 2, 8, 3, 9, 4, 10];
    if (chiNgay === THANH_TAM_CHI[mIdx]) {
      addCat('Thánh tâm', 'Cầu phúc, tế tự', '');
    }

    // 25. Ích hậu
    var ICH_HAU_CHI = [0, 6, 1, 7, 2, 8, 3, 9, 4, 10, 5, 11];
    if (chiNgay === ICH_HAU_CHI[mIdx]) {
      addCat('Ích hậu', 'Tốt, nhất là giá thú', '');
    }

    // 26. Tục thế
    var TUC_THE_CHI = [1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6, 0];
    if (chiNgay === TUC_THE_CHI[mIdx]) {
      addCat('Tục thế', 'Tốt, nhất là giá thú', '');
    }

    // 27. Yếu yên
    var YEU_YEN_CHI = [2, 8, 3, 9, 4, 10, 5, 11, 6, 0, 7, 1];
    if (chiNgay === YEU_YEN_CHI[mIdx]) {
      addCat('Yếu yên', 'Tốt mọi việc, nhất là giá thú', '');
    }

    // 28. Phổ hộ (Hội hộ)
    var PHO_HO_CHI = [8, 2, 9, 3, 10, 4, 11, 5, 0, 6, 1, 7];
    if (chiNgay === PHO_HO_CHI[mIdx]) {
      addCat('Phổ hộ (Hội hộ)', 'Làm phúc, giá thú, xuất hành', '');
    }

    // 29. Sinh khí
    if (chiNgay === mod(m - 1, 12)) {
      addCat('Sinh khí', 'Làm sửa nhà, động thổ, trồng cây', '');
    }

    // 30. Dịch mã
    var DICH_MA_CHI = [8, 5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11];
    if (chiNgay === DICH_MA_CHI[mIdx]) {
      addCat('Dịch mã', 'Tốt mọi việc, nhất là xuất hành', '');
    }

    // 31. Giải thần
    var GIAI_THAN_CHI = [8, 8, 10, 10, 0, 0, 2, 2, 4, 4, 6, 6];
    if (chiNgay === GIAI_THAN_CHI[mIdx]) {
      addCat('Giải thần', 'Tế tự, giải oan, tố tụng. Giải được sát tinh', '');
    }

    // 32. Nguyệt giải
    var NGUYET_GIAI_CHI = [8, 8, 9, 9, 10, 10, 11, 11, 6, 6, 7, 7];
    if (chiNgay === NGUYET_GIAI_CHI[mIdx]) {
      addCat('Nguyệt giải', 'Tốt', '');
    }

    // 33. Hoàng ân
    var HOANG_AN_CHI = [10, 1, 2, 5, 9, 3, 0, 6, 11, 4, 8, 7];
    if (chiNgay === HOANG_AN_CHI[mIdx]) {
      addCat('Hoàng ân', 'Đại cát', '');
    }

    // 34. Minh tinh
    var MINH_TINH_CHI = [8, 10, 0, 2, 4, 6, 8, 10, 0, 2, 4, 6];
    if (chiNgay === MINH_TINH_CHI[mIdx]) {
      addCat('Minh tinh', 'Tốt', '');
    }

    // 35. Ngũ phú
    var NGU_PHU_CHI = [11, 2, 5, 8, 11, 2, 5, 8, 11, 2, 5, 8];
    if (chiNgay === NGU_PHU_CHI[mIdx]) {
      addCat('Ngũ phú', 'Đại cát', '');
    }

    // 36. Tuế hợp
    var TUE_HOP_CHI = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    if (chiNgay === TUE_HOP_CHI[mIdx]) {
      addCat('Tuế hợp', 'Tốt', '');
    }

    // 37. Lục hợp
    var LUC_HOP_M_CHI = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    if (chiNgay === LUC_HOP_M_CHI[mIdx]) {
      addCat('Lục hợp', 'Đại cát', '');
    }

    // 38. Tam hợp
    for (var g = 0; g < 4; g++) {
      if (TAM_HOP_CHI[g].indexOf(chiThang) >= 0 && TAM_HOP_CHI[g].indexOf(chiNgay) >= 0 && chiNgay !== chiThang) {
        addCat('Tam hợp', 'Đại cát', '');
        break;
      }
    }

    // 39. Mẫu thương
    if ((mua === 0 && (chiNgay === 11 || chiNgay === 0)) ||
        (mua === 1 && (chiNgay === 2 || chiNgay === 3)) ||
        (mua === 2 && (chiNgay === 4 || chiNgay === 1)) ||
        (mua === 3 && (chiNgay === 8 || chiNgay === 9))) {
      addCat('Mẫu thương', 'Khai trương, tài lộc', '');
    }

    // 40. Đại hồng sa
    if ((mua === 0 && (chiNgay === 0 || chiNgay === 1)) ||
        (mua === 1 && (chiNgay === 4 || chiNgay === 5)) ||
        (mua === 2 && (chiNgay === 6 || chiNgay === 7)) ||
        (mua === 3 && (chiNgay === 8 || chiNgay === 10))) {
      addCat('Đại hồng sa', 'Tốt', '');
    }

    // 41. Dân nhật, Thời đức
    var DAN_NHAT_CHI = [6, 6, 6, 9, 9, 9, 0, 0, 0, 3, 3, 3];
    if (chiNgay === DAN_NHAT_CHI[mIdx]) {
      addCat('Dân nhật, Thời đức', 'Tốt', '');
    }

    // 42. Quan nhật
    var QUAN_NHAT_MAP = { 2: 3, 5: 6, 8: 9, 11: 0 };
    if (QUAN_NHAT_MAP[m] !== undefined && chiNgay === QUAN_NHAT_MAP[m]) {
      addCat('Quan nhật', 'Tốt', '');
    }

    // 43. Thiên quý
    if ((mua === 0 && (canNgay === 0 || canNgay === 1)) ||
        (mua === 1 && (canNgay === 2 || canNgay === 3)) ||
        (mua === 2 && (canNgay === 6 || canNgay === 7)) ||
        (mua === 3 && (canNgay === 8 || canNgay === 9))) {
      addCat('Thiên quý', 'Đại cát', '');
    }

    // 44. Thiên phúc
    var THIEN_PHUC_CANS = [
      [5], [4], [5], [7, 9], [6, 8], [7, 9], [1], [0], [1], [3], [2], [3]
    ];
    if (THIEN_PHUC_CANS[mIdx].indexOf(canNgay) >= 0) {
      addCat('Thiên phúc', 'Tốt', '');
    }

    // 45. Tuế đức
    if (lunarYear !== undefined && lunarYear !== null) {
      var canNam = mod(lunarYear + 6, 10);
      var TUE_DUC_BY_YEAR_CAN = [0, 6, 2, 8, 4, 0, 6, 2, 8, 4];
      if (canNgay === TUE_DUC_BY_YEAR_CAN[canNam]) {
        addCat('Tuế đức', 'Tốt', '');
      }
    }

    // 46. Ngũ hợp
    var NGU_HOP_CC = ['Giáp Dần', 'Ất Mão', 'Mậu Ngọ', 'Kỷ Mùi', 'Tân Dậu', 'Quý Hợi'];
    if (NGU_HOP_CC.indexOf(cc) >= 0) {
      addCat('Ngũ hợp', 'Tốt', '');
    }

    // 47. Thiên ân
    var THIEN_AN_CC = [
      'Giáp Tý', 'Ất Sửu', 'Bính Dần', 'Đinh Mão', 'Mậu Thìn',
      'Kỷ Mão', 'Canh Thìn', 'Tân Tỵ', 'Nhâm Ngọ', 'Quý Mùi',
      'Canh Tuất', 'Tân Hợi', 'Nhâm Thân', 'Quý Sửu'
    ];
    if (THIEN_AN_CC.indexOf(cc) >= 0) {
      addCat('Thiên ân', 'Đại cát', '');
    }

    // 48. Thiên thụy
    var THIEN_THUY_CC = ['Mậu Dần', 'Kỷ Mão', 'Canh Dần', 'Tân Tỵ', 'Nhâm Tý'];
    if (THIEN_THUY_CC.indexOf(cc) >= 0) {
      addCat('Thiên thụy', 'Đại cát', '');
    }

    // 49. Nhân chuyên
    var NHAN_CHUYEN_MAP = {
      1: ['Kỷ Sửu', 'Canh Thìn', 'Tân Mùi'],
      2: ['Mậu Tý', 'Ất Mão', 'Bính Ngọ', 'Đinh Dậu'],
      3: ['Đinh Hợi', 'Mậu Dần', 'Kỷ Tỵ', 'Quý Hợi'],
      4: ['Kỷ Sửu', 'Đinh Mùi', 'Mậu Tuất'],
      5: ['Mậu Tý', 'Kỷ Mão', 'Canh Ngọ'],
      0: ['Giáp Dần', 'Ất Tỵ', 'Bính Thân', 'Đinh Hợi']
    };
    if (NHAN_CHUYEN_MAP[mMod6] && NHAN_CHUYEN_MAP[mMod6].indexOf(cc) >= 0) {
      addCat('Nhân chuyên', 'Đại cát, giải được Sát tinh', '');
    }

    // 50. Sát cống
    var SAT_CONG_MAP = {
      1: ['Bính Tý', 'Đinh Mão', 'Ất Dậu', 'Tân Dậu'],
      2: ['Nhâm Dần', 'Quý Tỵ', 'Canh Thân', 'Tân Hợi'],
      3: ['Ất Sửu', 'Kỷ Mùi', 'Quý Mùi', 'Giáp Tuất'],
      4: ['Nhâm Tý', 'Quý Mão', 'Giáp Ngọ'],
      5: ['Bính Dần', 'Giáp Thân', 'Canh Thân', 'Ất Hợi'],
      0: ['Tân Sửu', 'Nhâm Thìn', 'Kỷ Mùi', 'Canh Tuất']
    };
    if (SAT_CONG_MAP[mMod6] && SAT_CONG_MAP[mMod6].indexOf(cc) >= 0) {
      addCat('Sát cống', 'Đại cát, giải được Sát tinh', '');
    }

    // 51. Trực tinh
    var TRUC_TINH_MAP = {
      1: ['Đinh Sửu', 'Mậu Thìn', 'Bính Tuất', 'Nhâm Tuất'],
      2: ['Nhâm Tý', 'Quý Mão', 'Giáp Ngọ'],
      3: ['Bính Dần', 'Giáp Thân', 'Canh Thân', 'Ất Hợi'],
      4: ['Quý Sửu', 'Giáp Thìn', 'Ất Mùi'],
      5: ['Bính Tý', 'Đinh Mão', 'Ất Dậu', 'Tân Dậu'],
      0: ['Nhâm Dần', 'Quý Tỵ', 'Canh Thân', 'Tân Hợi']
    };
    if (TRUC_TINH_MAP[mMod6] && TRUC_TINH_MAP[mMod6].indexOf(cc) >= 0) {
      addCat('Trực tinh', 'Đại cát, giải được Sát tinh', '');
    }

    // ==============================================================
    // II. 59 SÁT TINH (SAO XẤU / HUNG TINH)
    // ==============================================================

    // 1. Thiên cương (Diệt môn)
    var THIEN_CUONG_CHI = [5, 0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10];
    if (chiNgay === THIEN_CUONG_CHI[mIdx] || (m === 5 && (cc === 'Mậu Tý' || cc === 'Mậu Dần' || cc === 'Mậu Thìn'))) {
      addHung('Thiên cương (Diệt môn)', 'Đại hung', '');
    }

    // 2. Thụ tử
    var THU_TU_CHI = [10, 4, 11, 5, 0, 6, 1, 7, 2, 8, 3, 9];
    if (chiNgay === THU_TU_CHI[mIdx]) {
      addHung('Thụ tử', 'Đại hung, riêng săn bắn tốt', '');
    }

    // 3. Sát chủ
    var SAT_CHU_CHI = [5, 0, 7, 3, 8, 10, 1, 11, 6, 9, 2, 4];
    if (chiNgay === SAT_CHU_CHI[mIdx]) {
      addHung('Sát chủ', 'Đại hung', '');
    }

    // 4. Nguyệt phá
    if (chiNgay === mod(m + 7, 12)) {
      addHung('Nguyệt phá', 'Xấu về xây dựng nhà cửa', 'Trùng Trực Phá');
    }

    // 5. Đại hao (Tử khí, Quan phù)
    if (chiNgay === mod(m + 5, 12)) {
      addHung('Đại hao (Tử khí, Quan phù)', 'Đại hung', 'Trùng Trực Định và cùng ngày Tam hợp');
    }

    // 6. Tiểu hao
    if (chiNgay === mod(m + 4, 12)) {
      addHung('Tiểu hao', 'Xấu về cầu tài, kinh doanh', 'Trùng Trực Bình, trước Đại hao 1 ngày');
    }

    // 7. Kiếp sát
    var KIEP_SAT_CHI = [11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5, 2];
    if (chiNgay === KIEP_SAT_CHI[mIdx]) {
      addHung('Kiếp sát', 'Kỵ xuất hành, giá thú, an táng, xây dựng', '');
    }

    // 8. Tai sát (Phi ma sát)
    var TAI_SAT_CHI = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3];
    if (chiNgay === TAI_SAT_CHI[mIdx]) {
      addHung('Tai sát (Phi ma sát)', 'Kỵ giá thú, nhập trạch', '');
    }

    // 9. Nguyệt sát (Nguyệt hư)
    var NGUYET_SAT_CHI = [1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7, 4];
    if (chiNgay === NGUYET_SAT_CHI[mIdx]) {
      addHung('Nguyệt sát (Nguyệt hư)', 'Xấu với mở cửa, mở hàng, giá thú', '');
    }

    // 10. Nguyệt hình
    var NGUYET_HINH_CHI = [5, 0, 4, 8, 6, 1, 2, 9, 7, 11, 3, 10];
    if (chiNgay === NGUYET_HINH_CHI[mIdx]) {
      addHung('Nguyệt hình', 'Xấu', '');
    }

    // 11. Nguyệt yếm
    var NGUYET_YEM_CHI = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11];
    if (chiNgay === NGUYET_YEM_CHI[mIdx]) {
      addHung('Nguyệt yếm', 'Xấu với xuất hành, giá thú', '');
    }

    // 12. Nguyệt hỏa (Độc hỏa)
    var NGUYET_HOA_CHI = [5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7, 6];
    if (chiNgay === NGUYET_HOA_CHI[mIdx]) {
      addHung('Nguyệt hỏa (Độc hỏa)', 'Xấu với lợp nhà, làm bếp', '');
    }

    // 13. Thiên hỏa, Thiên ngục
    var THIEN_HOA_CHI = [0, 3, 6, 9, 0, 3, 6, 9, 0, 3, 6, 9];
    if (chiNgay === THIEN_HOA_CHI[mIdx]) {
      addHung('Thiên hỏa, Thiên ngục', 'Xấu về lợp nhà', '');
    }

    // 14. Hỏa tai
    var HOA_TAI_CHI = [1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6, 0];
    if (chiNgay === HOA_TAI_CHI[mIdx]) {
      addHung('Hỏa tai', 'Xấu với lợp nhà, làm nhà', '');
    }

    // 15. Hỏa tinh
    var HOA_TINH_MAP = {
      1: ['Ất Sửu', 'Kỷ Mùi', 'Quý Mùi', 'Giáp Tuất'],
      2: ['Canh Tý', 'Tân Mão', 'Mậu Ngọ', 'Kỷ Dậu'],
      3: ['Canh Dần', 'Đinh Tỵ', 'Tân Tỵ', 'Nhâm Thân', 'Quý Hợi'],
      4: ['Tân Sửu', 'Nhâm Thìn', 'Kỷ Mùi', 'Canh Tuất'],
      5: ['Giáp Tý', 'Tân Mão', 'Mậu Ngọ', 'Nhâm Ngọ', 'Quý Dậu'],
      0: ['Canh Dần', 'Đinh Tỵ', 'Mậu Thân', 'Kỷ Hợi']
    };
    if (HOA_TINH_MAP[mMod6] && HOA_TINH_MAP[mMod6].indexOf(cc) >= 0) {
      addHung('Hỏa tinh', 'Xấu với lợp nhà, làm bếp', '');
    }

    // 16. Thiên ôn
    var THIEN_ON_CHI = [7, 10, 4, 2, 6, 0, 9, 8, 5, 11, 1, 3];
    if (chiNgay === THIEN_ON_CHI[mIdx]) {
      addHung('Thiên ôn', 'Kỵ xây dựng', '');
    }

    // 17. Thiên tặc
    var THIEN_TAC_CHI = [4, 9, 2, 7, 0, 5, 10, 3, 8, 1, 6, 11];
    if (chiNgay === THIEN_TAC_CHI[mIdx]) {
      addHung('Thiên tặc', 'Xấu với khai trương, khởi tạo, động thổ, nhập trạch', '');
    }

    // 18. Địa tặc
    var DIA_TAC_CHI = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    if (chiNgay === DIA_TAC_CHI[mIdx]) {
      addHung('Địa tặc', 'Xấu với khởi tạo, động thổ, an táng, xuất hành', '');
    }

    // 19. Địa phá
    if (chiNgay === mod(m + 10, 12)) {
      addHung('Địa phá', 'Kỵ xây dựng', 'Trùng Trực Thu');
    }

    // 20. Thổ phủ
    if (chiNgay === mod(m + 1, 12)) {
      addHung('Thổ phủ', 'Kỵ xây dựng, động thổ', 'Trùng Trực Kiến');
    }

    // 21. Thổ ôn (Thiên cẩu)
    if (chiNgay === mod(m + 3, 12)) {
      addHung('Thổ ôn (Thiên cẩu)', 'Kỵ xây dựng, tế tự, đào ao, đào giếng', 'Trùng Trực Mãn');
    }

    // 22. Thổ cấm
    var THO_CAM_CHI = [11, 11, 11, 2, 2, 2, 5, 5, 5, 8, 8, 8];
    if (chiNgay === THO_CAM_CHI[mIdx]) {
      addHung('Thổ cấm', 'Kỵ xây dựng, an táng', '');
    }

    // 23. Vãng vong (Thổ kỵ)
    var VANG_VONG_CHI = [2, 5, 8, 11, 3, 6, 9, 0, 4, 7, 10, 1];
    if (chiNgay === VANG_VONG_CHI[mIdx]) {
      addHung('Vãng vong (Thổ kỵ)', 'Kỵ xuất hành, cầu tài, giá thú, động thổ', '');
    }

    // 24. Cửu không
    var CUU_KHONG_CHI = [4, 1, 10, 7, 3, 0, 9, 6, 2, 11, 8, 5];
    if (chiNgay === CUU_KHONG_CHI[mIdx]) {
      addHung('Cửu không', 'Kỵ xuất hành, cầu tài, khai trương', '');
    }

    // 25. Hoang vu & 26. Ngũ hư
    var HOANG_VU_SEASON = [
      [5, 9, 1],   // Xuân: Tỵ, Dậu, Sửu
      [8, 0, 4],   // Hạ: Thân, Tý, Thìn
      [11, 3, 7],  // Thu: Hợi, Mão, Mùi
      [2, 6, 10]   // Đông: Dần, Ngọ, Tuất
    ];
    if (HOANG_VU_SEASON[mua].indexOf(chiNgay) >= 0) {
      addHung('Hoang vu', 'Xấu', '');
      addHung('Ngũ hư', 'Kỵ khởi tạo, giá thú, an táng', '');
    }

    // 27. Không phòng
    var KHONG_PHONG_SEASON = [
      [4, 0, 5],   // Xuân: Thìn, Tý, Tỵ
      [10, 7, 11], // Hạ: Tuất, Mùi, Hợi
      [2, 3, 6],   // Thu: Dần, Mão, Ngọ
      [8, 9, 1]    // Đông: Thân, Dậu, Sửu
    ];
    if (KHONG_PHONG_SEASON[mua].indexOf(chiNgay) >= 0) {
      addHung('Không phòng', 'Kỵ giá thú', '');
    }

    // 28. Cô thần
    if (chiNgay === mod(m + 9, 12)) {
      addHung('Cô thần', 'Xấu với giá thú', 'Trùng Trực Thành');
    }

    // 29. Quả tú
    if (chiNgay === mod(m + 3, 12)) {
      addHung('Quả tú', 'Xấu với giá thú', 'Trùng Trực Mãn, Thiên phú, Thổ ôn');
    }

    // 30. Tứ thời cô quả
    var TU_THOI_CO_QUA_SEASON = [1, 4, 7, 10];
    if (chiNgay === TU_THOI_CO_QUA_SEASON[mua]) {
      addHung('Tứ thời cô quả', 'Kỵ giá thú', '');
    }

    // 31. Bạch hổ
    var BACH_HO_CHI = [6, 8, 10, 0, 2, 4, 6, 8, 10, 0, 2, 4];
    if (chiNgay === BACH_HO_CHI[mIdx]) {
      addHung('Bạch hổ', 'Kỵ mai táng', 'Trùng Thiên giải');
    }

    // 32. Huyền vũ
    var HUYEN_VU_CHI = [9, 11, 1, 3, 5, 7, 9, 11, 1, 3, 5, 7];
    if (chiNgay === HUYEN_VU_CHI[mIdx]) {
      addHung('Huyền vũ', 'Kỵ mai táng', '');
    }

    // 33. Câu trận
    var CAU_TRAN_CHI = [11, 1, 3, 5, 7, 9, 11, 1, 3, 5, 7, 9];
    if (chiNgay === CAU_TRAN_CHI[mIdx]) {
      addHung('Câu trận', 'Kỵ mai táng', '');
    }

    // 34. Chu tước hắc đạo
    var CHU_TUOC_CHI = [3, 5, 7, 9, 11, 1, 3, 5, 7, 9, 11, 1];
    if (chiNgay === CHU_TUOC_CHI[mIdx]) {
      addHung('Chu tước hắc đạo', 'Kỵ nhập trạch, khai trương', '');
    }

    // 35. Lôi công
    var LOI_CONG_CHI = [2, 11, 5, 8, 2, 11, 5, 8, 2, 11, 5, 8];
    if (chiNgay === LOI_CONG_CHI[mIdx]) {
      addHung('Lôi công', 'Kỵ với xây dựng nhà', '');
    }

    // 36. Lỗ ban sát
    var LO_BAN_SEASON = [0, 3, 6, 9];
    if (chiNgay === LO_BAN_SEASON[mua]) {
      addHung('Lỗ ban sát', 'Kỵ khởi tạo', '');
    }

    // 37. Phủ đầu dát
    var PHU_DAU_SEASON = [4, 7, 9, 0];
    if (chiNgay === PHU_DAU_SEASON[mua]) {
      addHung('Phủ đầu dát', 'Kỵ khởi tạo', '');
    }

    // 38. Nguyệt kiến chuyển sát
    var NGUYET_KIEN_CS_SEASON = [3, 6, 9, 0];
    if (chiNgay === NGUYET_KIEN_CS_SEASON[mua]) {
      addHung('Nguyệt kiến chuyển sát', 'Kỵ động thổ', '');
    }

    // 39. Tam tang
    var TAM_TANG_SEASON = [4, 7, 10, 1];
    if (chiNgay === TAM_TANG_SEASON[mua]) {
      addHung('Tam tang', 'Kỵ khởi tạo, giá thú, an táng', '');
    }

    // 40. Lục bất thành
    var LUC_BAT_THANH_CHI = [2, 6, 10, 5, 9, 1, 8, 0, 4, 11, 3, 7];
    if (chiNgay === LUC_BAT_THANH_CHI[mIdx]) {
      addHung('Lục bất thành', 'Xấu với xây dựng', '');
    }

    // 41. Băng tiêu
    var BANG_TIEU_CHI = [5, 0, 1, 2, 3, 10, 11, 6, 7, 8, 9, 4];
    if (chiNgay === BANG_TIEU_CHI[mIdx]) {
      addHung('Băng tiêu', 'Xấu', '');
    }

    // 42. Hà khôi, Cẩu giảo
    var HA_KHOI_CHI = [11, 6, 1, 8, 3, 10, 5, 0, 7, 2, 9, 4];
    if (chiNgay === HA_KHOI_CHI[mIdx]) {
      addHung('Hà khôi, Cẩu giảo', 'Xấu, kỵ khởi công', '');
    }

    // 43. Thiên lại
    var THIEN_LAI_CHI = [9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0];
    if (chiNgay === THIEN_LAI_CHI[mIdx]) {
      addHung('Thiên lại', 'Xấu', '');
    }

    // 44. Tiểu hồng sa
    var TIEU_HONG_SA_CHI = [5, 9, 1, 5, 9, 1, 5, 9, 1, 5, 9, 1];
    if (chiNgay === TIEU_HONG_SA_CHI[mIdx]) {
      addHung('Tiểu hồng sa', 'Xấu', '');
    }

    // 45. Hoàng sa
    var HOANG_SA_CHI = [6, 2, 0, 6, 2, 0, 6, 2, 0, 6, 2, 0];
    if (chiNgay === HOANG_SA_CHI[mIdx]) {
      addHung('Hoàng sa', 'Xấu với xuất hành', '');
    }

    // 46. Ngũ quỷ
    var NGU_QUY_CHI = [6, 2, 4, 9, 3, 8, 1, 5, 0, 11, 7, 10];
    if (chiNgay === NGU_QUY_CHI[mIdx]) {
      addHung('Ngũ quỷ', 'Kỵ xuất hành', '');
    }

    // 47. Tội chí
    var TOI_CHI_MAP = [6, 0, 7, 1, 8, 2, 9, 3, 10, 4, 11, 5];
    if (chiNgay === TOI_CHI_MAP[mIdx]) {
      addHung('Tội chí', 'Xấu với tế tự, kiện cáo', '');
    }

    // 48. Thần cách
    var THAN_CACH_CHI = [5, 3, 1, 11, 9, 7, 5, 3, 1, 11, 9, 7];
    if (chiNgay === THAN_CACH_CHI[mIdx]) {
      addHung('Thần cách', 'Kỵ tế tự', '');
    }

    // 49. Nhân cách
    var NHAN_CACH_CHI = [9, 7, 5, 3, 1, 11, 9, 7, 5, 3, 1, 11];
    if (chiNgay === NHAN_CACH_CHI[mIdx]) {
      addHung('Nhân cách', 'Xấu với khởi tạo, giá thú', '');
    }

    // 50. Ly sàng
    if ((mua === 0 && chiNgay === 9) ||
        (mua === 1 && (chiNgay === 2 || chiNgay === 6)) ||
        (mua === 2 && chiNgay === 10) ||
        (mua === 3 && chiNgay === 5)) {
      addHung('Ly sàng', 'Kỵ giá thú', '');
    }

    // 51. Ly Sào
    var LY_SAO_CC = [
      'Mậu Tý', 'Mậu Dần', 'Mậu Thìn', 'Mậu Ngọ', 'Mậu Thân', 'Mậu Tuất',
      'Kỷ Sửu', 'Kỷ Tỵ', 'Kỷ Dậu', 'Tân Sửu', 'Tân Mão', 'Tân Tỵ',
      'Nhâm Tuất', 'Quý Tỵ'
    ];
    if (LY_SAO_CC.indexOf(cc) >= 0) {
      addHung('Ly Sào', 'Xấu với xuất hành, giá thú, khởi tạo', '');
    }

    // 52. Cửu thổ quỷ
    var CUU_THO_QUY_CC = [
      'Đinh Sửu', 'Tân Sửu', 'Nhâm Dần', 'Quý Tỵ',
      'Giáp Ngọ', 'Mậu Ngọ', 'Ất Dậu', 'Kỷ Dậu', 'Canh Tuất'
    ];
    if (CUU_THO_QUY_CC.indexOf(cc) >= 0) {
      addHung('Cửu thổ quỷ', 'Không kỵ Cát tinh', '');
    }

    // 53. Quỷ khốc
    if (chiNgay === 10 && canNgay % 2 === 0) {
      addHung('Quỷ khốc', 'Xấu với tế tự, mai táng', '');
    }

    // 54. Trùng tang
    var TRUNG_TANG_CAN = [0, 1, 5, 2, 3, 5, 6, 7, 5, 8, 9, 5];
    if (canNgay === TRUNG_TANG_CAN[mIdx]) {
      addHung('Trùng tang', 'Đại hung, Kỵ giá thú, an táng, khởi công', '');
    }

    // 55. Trùng phục
    var TRUNG_PHUC_CAN = [6, 7, 5, 8, 9, 4, 0, 1, 5, 8, 9, 5];
    if (canNgay === TRUNG_PHUC_CAN[mIdx]) {
      addHung('Trùng phục', 'Kỵ giá thú, an táng', '');
    }

    // 56. Xích khẩu
    var XICH_KHAU_CHI = [
      [0, 6],  // M1: Tý, Ngọ
      [5, 11], // M2: Tỵ, Hợi
      [3, 9],  // M3: Mão, Dậu
      [2, 8],  // M4: Dần, Thân
      [0, 6],  // M5: Tý, Ngọ
      [4, 10], // M6: Thìn, Tuất
      [3, 9],  // M7: Mão, Dậu
      [1, 7],  // M8: Sửu, Mùi
      [5, 11], // M9: Tỵ, Hợi
      [4, 10], // M10: Thìn, Tuất
      [3, 9],  // M11: Mão, Dậu
      [2, 8]   // M12: Dần, Thân
    ];
    if (XICH_KHAU_CHI[mIdx].indexOf(chiNgay) >= 0) {
      addHung('Xích khẩu', 'Kỵ giá thú, giao dịch, yến tiệc', '');
    }

    // 57. Đại không vong
    var DKV_START = [6, 5, 4, 3, 2, 1, 8, 7, 6, 5, 4, 3];
    if (d >= DKV_START[mIdx] && (d - DKV_START[mIdx]) % 8 === 0) {
      addHung('Đại không vong', 'Kỵ xuất hành, giao dịch, giao tài vật', '');
    }

    // 58. Tiểu không vong
    var TKV_START = [2, 1, 8, 7, 6, 5, 4, 3, 2, 1, 8, 7];
    if (d >= TKV_START[mIdx] && (d - TKV_START[mIdx]) % 8 === 0) {
      addHung('Tiểu không vong', 'Kỵ xuất hành, giao dịch, giao tài vật', '');
    }

    // 59. Thập ác đại bại
    var THAP_AC_CC = [
      'Giáp Thìn', 'Ất Tỵ', 'Bính Thân', 'Đinh Hợi', 'Mậu Tuất',
      'Kỷ Sửu', 'Canh Thìn', 'Tân Tỵ', 'Nhâm Thân', 'Quý Hợi'
    ];
    if (THAP_AC_CC.indexOf(cc) >= 0 || (m === 3 && d === 21) || (m === 9 && d === 24) || (m === 10 && d === 18)) {
      addHung('Thập ác đại bại', 'Đại hung', '');
    }

    return {
      catTinh: catTinh,
      hungTinh: hungTinh,
      tongCat: catTinh.length,
      tongHung: hungTinh.length
    };
  }

  // ==============================================================
  // THUẬT TOÁN PHONG THỦY Á ĐÔNG MỞ RỘNG: KIM LÂU, HOANG ỐC, LƯU NGUYỆT 12 THÁNG
  // ==============================================================

  // 1. TÍNH HẠN KIM LÂU (Á ĐÔNG CỔ BẢN)
  // "1, 3, 6, 8 Kim Lâu - Làm nhà, cưới vợ, tậu trâu thì đừng"
  function kiemTraKimLau(tuoiMu) {
    var du = tuoiMu % 9;
    if (du === 1) {
      return { pham: true, loai: 'Kim Lâu Thân', moTa: 'Kỵ chính bản thân gia chủ. Làm nhà hay cưới hỏi năm này dễ chuốc tai bay vạ gió, sức khỏe hao tổn.' };
    } else if (du === 3) {
      return { pham: true, loai: 'Kim Lâu Thê', moTa: 'Kỵ người phối ngẫu, vợ hoặc chồng. Làm nhà năm này dễ gây tai ương cho gia đạo bất hòa, tổn hao sinh khí.' };
    } else if (du === 6) {
      return { pham: true, loai: 'Kim Lâu Tử', moTa: 'Kỵ con cái trong nhà. Cưới xin làm nhà năm này dễ mang lại điềm hung, trắc trở đường con cái.' };
    } else if (du === 8) {
      return { pham: true, loai: 'Kim Lâu Súc', moTa: 'Kỵ vật nuôi, gia súc và tài sản kinh tế gia đình. Làm ăn dễ thất thoát, vật nuôi dịch bệnh, kinh doanh thua lỗ.' };
    }
    return { pham: false, loai: 'Không phạm Kim Lâu', moTa: 'Năm nay tuổi đẹp, không phạm Kim Lâu. Thuận lợi cho việc cưới hỏi, làm nhà, mưu cầu việc lớn.' };
  }

  // 2. TÍNH HẠN HOANG ỐC (BÁCH KHOA TOÀN THƯ PHONG THỦY)
  // 6 Cung: Nhất Cát, Nhì Nghi, Tam Địa Sát, Tứ Tấn Tài, Ngũ Thọ Tử, Lục Hoang Ốc
  function kiemTraHoangOc(tuoiMu) {
    var HO_MAP = {
      1: { ten: 'Nhất Cát', tinhChat: 'Tốt', moTa: 'Nhất Cát an cư thông vạn sự. Làm nhà tuổi này đắc an cư lạc nghiệp, vạn sự hanh thông đại lợi.' },
      2: { ten: 'Nhì Nghi', tinhChat: 'Tốt', moTa: 'Nhì Nghi tấn thất địa sinh tài. Làm nhà tuổi này nhà cửa hưng vượng, làm ăn phát đạt, giàu sang phú quý.' },
      3: { ten: 'Tam Địa Sát', tinhChat: 'Xấu', moTa: 'Tam Sát nhơn do giai đắc tử. Làm nhà phạm cung này gia chủ dễ mắc bệnh tật, tai nạn bất ngờ.' },
      4: { ten: 'Tứ Tấn Tài', tinhChat: 'Tốt', moTa: 'Tứ Tấn Tài chi phước lộc lai. Làm nhà tuổi này đón nhận tài lộc dồi dào, kinh doanh hưng thịnh.' },
      5: { ten: 'Ngũ Thọ Tử', tinhChat: 'Đại Hung', moTa: 'Ngũ Tử ly thân phòng tử biệt. Làm nhà tuổi này gia đình dễ chia rẽ, lâm cảnh sinh ly tử biệt.' },
      6: { ten: 'Lục Hoang Ốc', tinhChat: 'Xấu', moTa: 'Lục Ốc tạo gia bất khả thành. Làm nhà tuổi này việc khó thành, nhà cửa lạnh lẽo, trắc trở triền miên.' }
    };

    var chuc = Math.floor(tuoiMu / 10);
    var le = tuoiMu % 10;
    var start = (chuc > 0) ? (((chuc - 1) % 6) + 1) : 1;
    var cung = ((start - 1 + le) % 6) + 1;
    var res = HO_MAP[cung] || HO_MAP[1];
    return {
      cung: cung,
      ten: res.ten,
      tinhChat: res.tinhChat,
      moTa: res.moTa,
      laTot: (res.tinhChat === 'Tốt')
    };
  }

  // 3. TÍNH LƯU NGUYỆT 12 THÁNG ÂM LỊCH CHO ĐƯƠNG SỐ TRONG NĂM XÉT
  function tinhLuuNguyet12Thang(namXet, canTuoiIdx, chiTuoiIdx, hanhTuoi) {
    var list = [];
    var canNamXet = mod(namXet + 6, 10);
    var canThang1 = (canNamXet * 2 + 1) % 10;

    var THANG_TEN = [
      'Tháng 1 (Giêng)', 'Tháng 2 (Hai)', 'Tháng 3 (Ba)', 'Tháng 4 (Tư)',
      'Tháng 5 (Năm)', 'Tháng 6 (Sáu)', 'Tháng 7 (Bảy)', 'Tháng 8 (Tám)',
      'Tháng 9 (Chín)', 'Tháng 10 (Mười)', 'Tháng 11 (Một)', 'Tháng 12 (Chạp)'
    ];

    for (var m = 1; m <= 12; m++) {
      var cThang = (canThang1 + m - 1) % 10;
      var zThang = mod(m + 1, 12); // Tháng 1 là Dần (2)
      var tenThang = CAN[cThang] + ' ' + CHI[zThang];

      var dgChi = 'Bình thường';
      var isTot = false;
      var isXau = false;
      var ghiChu = '';

      if (LUC_XUNG[zThang] === chiTuoiIdx) {
        dgChi = 'Xung tuổi';
        isXau = true;
        ghiChu = 'Tháng Lục Xung: Tránh xuất hành xa, cẩn trọng lời ăn tiếng nói, đề phòng tranh cãi và biến động việc làm.';
      } else if (LUC_HAI[zThang] === chiTuoiIdx) {
        dgChi = 'Hại tuổi';
        isXau = true;
        ghiChu = 'Tháng Tương Hại: Đề phòng kẻ gian hãm hại, thị phi bất ngờ, cất giữ tài sản cẩn thận.';
      } else if (LUC_HOP[zThang] === chiTuoiIdx) {
        dgChi = 'Lục Hợp';
        isTot = true;
        ghiChu = 'Tháng Lục Hợp cát tường: Quý nhân trợ mệnh, gia đạo hỷ khí, mưu sự làm ăn hanh thông thuận lợi.';
      } else {
        // Kiểm tra tam hợp
        for (var th = 0; th < 4; th++) {
          if (TAM_HOP_CHI[th].indexOf(zThang) >= 0 && TAM_HOP_CHI[th].indexOf(chiTuoiIdx) >= 0 && zThang !== chiTuoiIdx) {
            dgChi = 'Tam Hợp';
            isTot = true;
            ghiChu = 'Tháng Tam Hợp vượng khí: Thích hợp mở rộng kinh doanh, ký kết hợp đồng, sức khỏe bình an.';
            break;
          }
        }
      }

      if (!isTot && !isXau) {
        if (zThang === chiTuoiIdx) {
          ghiChu = 'Tháng trùng năm tuổi: Công việc dồn dập, áp lực tâm lý, nên bình tĩnh an định xử lý.';
        } else {
          ghiChu = 'Tháng bình hòa ổn định: Duy trì công việc thường nhật, tài chính ổn định, tích phước thiện tâm.';
        }
      }

      list.push({
        thangSo: m,
        tenThangAm: THANG_TEN[m - 1],
        canChi: tenThang,
        danhGia: isTot ? 'Cát Lành' : (isXau ? 'Thận Trọng' : 'Bình Hòa'),
        cls: isTot ? 'good' : (isXau ? 'bad' : 'gold'),
        ghiChu: ghiChu
      });
    }
    return list;
  }

  // BẢNG THẦN SÁT XUẤT HÀNH KHỔNG MINH (22 SAO TỪ DATA5 EXCEL)
  var THAN_SAT_KM_MAP = {
    'Đương Phong': { danhGia: 'Rất Tốt', yNghia: 'Rất tốt, xuất hành thuận lợi, cầu tài được như ý muốn, gặp quý nhân phù trợ.' },
    'Kim Thổ': { danhGia: 'Xấu', yNghia: 'Ra đi nhỡ tàu nhỡ xe, cầu tài không được, trên đường đi mất của, bất lợi.' },
    'Kim Dương': { danhGia: 'Tốt', yNghia: 'Xuất hành tốt, có quý nhân phù trợ, tài lộc thông suốt, thưa kiện có nhiều lý phải.' },
    'Thuần Dương': { danhGia: 'Rất Tốt', yNghia: 'Xuất hành tốt, lúc về cũng tốt, nhiều thuận lợi, được người tốt giúp đỡ, cầu tài như ý, tranh luận thường thắng lợi.' },
    'Đạo Tặc': { danhGia: 'Rất Xấu', yNghia: 'Rất xấu. Xuất hành bị hại, mất của, đề phòng tiểu nhân.' },
    'Hảo Thương': { danhGia: 'Tốt', yNghia: 'Xuất hành thuận lợi, gặp người lớn vừa lòng, làm việc như ý muốn, áo phẩm vinh quy.' },
    'Thiên Đạo': { danhGia: 'Xấu', yNghia: 'Xuất hành cầu tài nên tránh, dù được cũng rất tốn kém, thất lý mà thua.' },
    'Thiên Môn': { danhGia: 'Rất Tốt', yNghia: 'Xuất hành làm mọi việc đều vừa ý, cầu được ước thấy, mọi việc đều thành đạt.' },
    'Thiên Đường': { danhGia: 'Rất Tốt', yNghia: 'Xuất hành tốt, quý nhân phù trợ, buôn bán may mắn, mọi việc đều như ý.' },
    'Thiên Tài': { danhGia: 'Tốt', yNghia: 'Nên xuất hành, cầu tài thắng lợi. Được người tốt giúp đỡ. Mọi việc đều thuận.' },
    'Thiên Tặc': { danhGia: 'Rất Xấu', yNghia: 'Xuất hành xấu, cầu tài không được. Đi đường dễ mất cắp. Mọi việc đều rất xấu.' },
    'Thiên Dương': { danhGia: 'Rất Tốt', yNghia: 'Xuất hành tốt, cầu tài được tài. Hỏi vợ được vợ. Mọi việc đều như ý muốn.' },
    'Thiên Hầu': { danhGia: 'Xấu', yNghia: 'Xuất hành dầu ít hay nhiều cũng cãi cọ, phải tránh xảy ra tai nạn chảy máu.' },
    'Thiên Thương': { danhGia: 'Tốt', yNghia: 'Xuất hành để gặp cấp trên thì tuyệt vời, cầu tài thì được tài. Mọi việc đều thuận lợi.' },
    'Chu Tước': { danhGia: 'Xấu', yNghia: 'Xuất hành, cầu tài đều xấu. Hay mất của, kiện cáo thua vì đuối lý.' },
    'Bạch Hổ Đầu': { danhGia: 'Tốt', yNghia: 'Xuất hành, cầu tài đều được. Đi đâu đều thông đạt cả.' },
    'Bạch Hổ Kiếp': { danhGia: 'Tốt', yNghia: 'Xuất hành, cầu tài được như ý muốn, đi hướng Nam và Bắc rất thuận lợi.' },
    'Bạch Hổ Túc': { danhGia: 'Rất Xấu', yNghia: 'Cấm đi xa, làm việc gì cũng không thành công. Rất xấu trong mọi việc.' },
    'Huyền Vũ': { danhGia: 'Xấu', yNghia: 'Xuất hành thường gặp cãi cọ, gặp việc xấu, không nên đi.' },
    'Thanh Long Đầu': { danhGia: 'Tốt', yNghia: 'Xuất hành nên đi vào sáng sớm. Cầu tài thắng lợi. Mọi việc như ý.' },
    'Thanh Long Kiếp': { danhGia: 'Rất Tốt', yNghia: 'Xuất hành 4 phương, 8 hướng đều tốt, trăm sự được như ý.' },
    'Thanh Long Túc': { danhGia: 'Xấu', yNghia: 'Đi xa không nên, xuất hành xấu, tài lộc không có. Kiện cáo cũng đuối lý.' }
  };

  var KM_NHOM_1 = ['Đương Phong', 'Kim Thổ', 'Kim Dương', 'Thuần Dương', 'Đạo Tặc', 'Hảo Thương'];
  var KM_NHOM_2 = ['Thiên Đạo', 'Thiên Môn', 'Thiên Đường', 'Thiên Tài', 'Thiên Tặc', 'Thiên Dương', 'Thiên Hầu', 'Thiên Thương'];
  var KM_NHOM_3 = ['Chu Tước', 'Bạch Hổ Đầu', 'Bạch Hổ Kiếp', 'Bạch Hổ Túc', 'Huyền Vũ', 'Thanh Long Đầu', 'Thanh Long Kiếp', 'Thanh Long Túc'];

  function getThanSatXuatHanh(lunarMonth, lunarDay) {
    var nhomThang = (lunarMonth - 1) % 3; // 0: tháng 1,4,7,10; 1: tháng 2,5,8,11; 2: tháng 3,6,9,12
    var tenSao = '';
    if (nhomThang === 0) {
      tenSao = KM_NHOM_1[(lunarDay - 1) % KM_NHOM_1.length];
    } else if (nhomThang === 1) {
      tenSao = KM_NHOM_2[(lunarDay - 1) % KM_NHOM_2.length];
    } else {
      tenSao = KM_NHOM_3[(lunarDay - 1) % KM_NHOM_3.length];
    }
    var info = THAN_SAT_KM_MAP[tenSao] || { danhGia: 'Bình', yNghia: 'Xuất hành bình hòa.' };
    return {
      ten: tenSao,
      danhGia: info.danhGia,
      yNghia: info.yNghia
    };
  }

  // HƯỚNG XUẤT HÀNH THEO THIÊN CAN NGÀY (HỶ THẦN & TÀI THẦN)
  function getHuongXuatHanh(canNgay) {
    var HUONG_MAP = {
      0: { hyThan: 'Đông Bắc', taiThan: 'Chính Nam', hacThan: 'Chính Bắc' }, // Giáp
      1: { hyThan: 'Tây Bắc', taiThan: 'Chính Đông', hacThan: 'Chính Bắc' }, // Ất
      2: { hyThan: 'Tây Nam', taiThan: 'Chính Đông', hacThan: 'Chính Nam' }, // Bính
      3: { hyThan: 'Chính Nam', taiThan: 'Chính Tây', hacThan: 'Chính Nam' }, // Đinh
      4: { hyThan: 'Đông Nam', taiThan: 'Chính Bắc', hacThan: 'Chính Đông' }, // Mậu
      5: { hyThan: 'Đông Bắc', taiThan: 'Chính Nam', hacThan: 'Chính Đông' }, // Kỷ
      6: { hyThan: 'Tây Bắc', taiThan: 'Chính Đông', hacThan: 'Chính Tây' }, // Canh
      7: { hyThan: 'Tây Nam', taiThan: 'Chính Đông', hacThan: 'Chính Tây' }, // Tân
      8: { hyThan: 'Chính Nam', taiThan: 'Chính Tây', hacThan: 'Tây Bắc' }, // Nhâm
      9: { hyThan: 'Đông Nam', taiThan: 'Chính Bắc', hacThan: 'Tây Bắc' }  // Quý
    };
    return HUONG_MAP[canNgay] || { hyThan: 'Đông Bắc', taiThan: 'Chính Nam', hacThan: 'Chính Bắc' };
  }

  // TÍNH SAO CỬU DIỆU & BÁT HẠN DỰ PHÒNG CHO MỌI LỨA TUỔI
  function getCuuDieuBatHanFallback(tuoiMu, isNam) {
    var SAO_NAM_9 = ['Mộc Đức (T)', 'La Hầu (N)', 'Thổ Tú', 'Thủy Diệu', 'Thái Bạch', 'Thái Dương (T)', 'Vân Hớn', 'Kế Đô (N)', 'Thái Âm (T)'];
    var SAO_NU_9  = ['Thủy Diệu', 'Kế Đô (N)', 'Vân Hớn', 'Mộc Đức (T)', 'Thái Âm (T)', 'Thổ Tú', 'La Hầu (N)', 'Thái Dương (T)', 'Thái Bạch'];
    var idx9 = ((tuoiMu - 1) % 9 + 9) % 9;
    var saoTen = isNam ? SAO_NAM_9[idx9] : SAO_NU_9[idx9];

    var HAN_NAM_8 = ['Huỳnh Tuyền', 'Tam Kheo', 'Ngũ Mộ', 'Thiên Tinh', 'Tán Tận', 'Thiên La', 'Địa Võng', 'Diêm Vương'];
    var HAN_NU_8  = ['Tán Tận', 'Thiên Tinh', 'Ngũ Mộ', 'Tam Kheo', 'Huỳnh Tuyền', 'Diêm Vương', 'Địa Võng', 'Thiên La'];
    var idx8 = ((tuoiMu - 1) % 8 + 8) % 8;
    var hanTen = isNam ? HAN_NAM_8[idx8] : HAN_NU_8[idx8];

    return {
      sao: saoTen,
      han: hanTen
    };
  }

  root.PT = {
    mod: mod,
    CAN: CAN,
    CHI: CHI,
    CON_GIAP: CON_GIAP,
    CON_ICON: CON_ICON,
    getCanChiNgay: getCanChiNgay,
    getCanChiThang: getCanChiThang,
    getCanChiGio: getCanChiGio,
    getLucDieuNgay: getLucDieuNgay,
    getLucDieuGio: getLucDieuGio,
    getTrucNgay: getTrucNgay,
    getSao28: getSao28,
    getGioHoangDao: getGioHoangDao,
    isNgayHoangDao: isNgayHoangDao,
    kiemTraThaiTue: kiemTraThaiTue,
    kiemTraTamTai: kiemTraTamTai,
    kiemTraKimLau: kiemTraKimLau,
    kiemTraHoangOc: kiemTraHoangOc,
    tinhLuuNguyet12Thang: tinhLuuNguyet12Thang,
    kiemTraNgayDacBiet: kiemTraNgayDacBiet,
    getSaoChieuNgayThongThu: getSaoChieuNgayThongThu,
    getThanSatXuatHanh: getThanSatXuatHanh,
    getHuongXuatHanh: getHuongXuatHanh,
    getCuuDieuBatHanFallback: getCuuDieuBatHanFallback,
    getTuoiData: getTuoiData,
    getPhongThuyData: getPhongThuyData
  };

  if (typeof module !== 'undefined') module.exports = root.PT;
})(typeof window !== 'undefined' ? window : globalThis);
