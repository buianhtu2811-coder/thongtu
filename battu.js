/* ==========================================================================
   HỆ THỐNG LẬP LÁ SỐ BÁT TỰ - TỨ TRỤ CHUẨN PHONGTHUYVUONG.COM (CHẾ ĐỘ DARK MODE)
   Tự động đồng bộ Ngày sinh, Giờ sinh, Giới tính, Năm xem hạn từ Thông Thư Bát Cổ
   ========================================================================== */
(function (root) {
  'use strict';

  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CAN_CODE = ['GIAP', 'AT', 'BINH', 'DINH', 'MAU', 'KY', 'CANH', 'TAN', 'NHAM', 'QUY'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var CHI_CODE = ['TY', 'SUU', 'DAN', 'MAO', 'THIN', 'TI', 'NGO', 'MUI', 'THAN', 'DAU', 'TUAT', 'HOI'];

  var CAN_HANH = ['MOC', 'MOC', 'HOA', 'HOA', 'THO', 'THO', 'KIM', 'KIM', 'THUY', 'THUY'];
  var CHI_HANH = ['THUY', 'THO', 'MOC', 'MOC', 'THO', 'HOA', 'HOA', 'THO', 'KIM', 'KIM', 'THO', 'THUY'];

  var HANH_LABEL = {
    KIM: 'Kim',
    MOC: 'Mộc',
    THUY: 'Thủy',
    HOA: 'Hỏa',
    THO: 'Thổ'
  };

  // Tàng can trong 12 Địa Chi (theo đúng thứ tự của phongthuyvuong.com)
  // Tý: Quý; Sửu: Kỷ, Quý, Tân; Dần: Giáp, Bính, Mậu; Mão: Ất; Thìn: Mậu, Ất, Quý; Tị: Bính, Mậu, Canh;
  // Ngọ: Đinh, Kỷ; Mùi: Kỷ, Đinh, Ất; Thân: Canh, Nhâm, Mậu; Dậu: Tân; Tuất: Mậu, Tân, Đinh; Hợi: Nhâm, Giáp
  var TANG_CAN = [
    [9],          // Tý: Quý
    [5, 9, 7],    // Sửu: Kỷ, Quý, Tân
    [0, 2, 4],    // Dần: Giáp, Bính, Mậu
    [1],          // Mão: Ất
    [4, 1, 9],    // Thìn: Mậu, Ất, Quý
    [2, 4, 6],    // Tị: Bính, Mậu, Canh
    [3, 5],       // Ngọ: Đinh, Kỷ
    [5, 3, 1],    // Mùi: Kỷ, Đinh, Ất
    [6, 8, 4],    // Thân: Canh, Nhâm, Mậu
    [7],          // Dậu: Tân
    [4, 7, 3],    // Tuất: Mậu, Tân, Đinh
    [8, 0]        // Hợi: Nhâm, Giáp
  ];

  // Trọng số Tàng Can (Bản khí, Trung khí, Dư khí) dùng cho tính Ngũ hành tương phối
  var TANG_WEIGHT = [
    [1.0],
    [0.6, 0.3, 0.1],
    [0.6, 0.3, 0.1],
    [1.0],
    [0.6, 0.3, 0.1],
    [0.6, 0.3, 0.1],
    [0.7, 0.3],
    [0.6, 0.3, 0.1],
    [0.6, 0.3, 0.1],
    [1.0],
    [0.6, 0.3, 0.1],
    [0.7, 0.3]
  ];

  // Vòng Trường Sinh (12 trạng thái)
  var VONG_TRUONG_SINH = [
    'Trường sinh', 'Mộc dục', 'Quan đới', 'Lâm quan', 'Đế vượng',
    'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
  ];

  // Chi khởi Trường Sinh của 10 Thiên Can (theo phongthuyvuong.com: Dương thuận Âm nghịch)
  // Giáp: Hợi(11), Ất: Ngọ(6), Bính: Dần(2), Đinh: Dậu(9), Mậu: Dần(2), Kỷ: Dậu(9), Canh: Tị(5), Tân: Tý(0), Nhâm: Thân(8), Quý: Mão(3)
  var TRUONG_SINH_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];

  function getTruongSinh(canIdx, chiIdx) {
    var start = TRUONG_SINH_START[canIdx];
    var isYang = (canIdx % 2 === 0);
    var offset = isYang ? (chiIdx - start + 12) % 12 : (start - chiIdx + 12) % 12;
    return VONG_TRUONG_SINH[offset];
  }

  // Bảng 60 Hoa Giáp Nạp Âm & Hành Nạp Âm
  var NAP_AM_60 = [
    { name: 'Hải Trung Kim', hanh: 'KIM' }, { name: 'Hải Trung Kim', hanh: 'KIM' },
    { name: 'Lư Trung Hỏa', hanh: 'HOA' }, { name: 'Lư Trung Hỏa', hanh: 'HOA' },
    { name: 'Đại Lâm Mộc', hanh: 'MOC' }, { name: 'Đại Lâm Mộc', hanh: 'MOC' },
    { name: 'Lộ Bàng Thổ', hanh: 'THO' }, { name: 'Lộ Bàng Thổ', hanh: 'THO' },
    { name: 'Kiếm Phong Kim', hanh: 'KIM' }, { name: 'Kiếm Phong Kim', hanh: 'KIM' },
    { name: 'Sơn Đầu Hỏa', hanh: 'HOA' }, { name: 'Sơn Đầu Hỏa', hanh: 'HOA' },
    { name: 'Giản Hạ Thủy', hanh: 'THUY' }, { name: 'Giản Hạ Thủy', hanh: 'THUY' },
    { name: 'Thành Đầu Thổ', hanh: 'THO' }, { name: 'Thành Đầu Thổ', hanh: 'THO' },
    { name: 'Bạch Lạp Kim', hanh: 'KIM' }, { name: 'Bạch Lạp Kim', hanh: 'KIM' },
    { name: 'Dương Liễu Mộc', hanh: 'MOC' }, { name: 'Dương Liễu Mộc', hanh: 'MOC' },
    { name: 'Tuyền Trung Thủy', hanh: 'THUY' }, { name: 'Tuyền Trung Thủy', hanh: 'THUY' },
    { name: 'Ốc Thượng Thổ', hanh: 'THO' }, { name: 'Ốc Thượng Thổ', hanh: 'THO' },
    { name: 'Tích Lịch Hỏa', hanh: 'HOA' }, { name: 'Tích Lịch Hỏa', hanh: 'HOA' },
    { name: 'Tùng Bách Mộc', hanh: 'MOC' }, { name: 'Tùng Bách Mộc', hanh: 'MOC' },
    { name: 'Trường Lưu Thủy', hanh: 'THUY' }, { name: 'Trường Lưu Thủy', hanh: 'THUY' },
    { name: 'Sa Trung Kim', hanh: 'KIM' }, { name: 'Sa Trung Kim', hanh: 'KIM' },
    { name: 'Sơn Hạ Hỏa', hanh: 'HOA' }, { name: 'Sơn Hạ Hỏa', hanh: 'HOA' },
    { name: 'Bình Địa Mộc', hanh: 'MOC' }, { name: 'Bình Địa Mộc', hanh: 'MOC' },
    { name: 'Bích Thượng Thổ', hanh: 'THO' }, { name: 'Bích Thượng Thổ', hanh: 'THO' },
    { name: 'Kim Bạch Kim', hanh: 'KIM' }, { name: 'Kim Bạch Kim', hanh: 'KIM' },
    { name: 'Phú Đăng Hỏa', hanh: 'HOA' }, { name: 'Phú Đăng Hỏa', hanh: 'HOA' },
    { name: 'Thiên Hà Thủy', hanh: 'THUY' }, { name: 'Thiên Hà Thủy', hanh: 'THUY' },
    { name: 'Đại Dịch Thổ', hanh: 'THO' }, { name: 'Đại Dịch Thổ', hanh: 'THO' },
    { name: 'Thoa Xuyến Kim', hanh: 'KIM' }, { name: 'Thoa Xuyến Kim', hanh: 'KIM' },
    { name: 'Tang Đố Mộc', hanh: 'MOC' }, { name: 'Tang Đố Mộc', hanh: 'MOC' },
    { name: 'Đại Khê Thủy', hanh: 'THUY' }, { name: 'Đại Khê Thủy', hanh: 'THUY' },
    { name: 'Sa Trung Thổ', hanh: 'THO' }, { name: 'Sa Trung Thổ', hanh: 'THO' },
    { name: 'Thiên Thượng Hỏa', hanh: 'HOA' }, { name: 'Thiên Thượng Hỏa', hanh: 'HOA' },
    { name: 'Thạch Lựu Mộc', hanh: 'MOC' }, { name: 'Thạch Lựu Mộc', hanh: 'MOC' },
    { name: 'Đại Hải Thủy', hanh: 'THUY' }, { name: 'Đại Hải Thủy', hanh: 'THUY' }
  ];

  function get60Index(canIdx, chiIdx) {
    for (var i = 0; i < 60; i++) {
      if (i % 10 === canIdx && i % 12 === chiIdx) return i;
    }
    return 0;
  }

  function getNapAm(canIdx, chiIdx) {
    return NAP_AM_60[get60Index(canIdx, chiIdx)];
  }

  function getKhongVong(canIdx, chiIdx) {
    var diff = (chiIdx - canIdx + 12) % 12;
    var kv1 = (diff + 10) % 12;
    var kv2 = (diff + 11) % 12;
    return [kv1, kv2];
  }

  // Tính Thập Thần so với Nhật Chủ (dayCan)
  // Trả về cả tên viết tắt (Tỷ, Kiếp, Thực, Thương, T.Tài, Tài, Sát, Quan, Kiêu, Ấn) và tên đầy đủ
  var HANH_INDEX = { MOC: 0, HOA: 1, THO: 2, KIM: 3, THUY: 4 }; // Sinh: (i+1)%5, Khắc: (i+2)%5

  function getThapThan(dayCanIdx, targetCanIdx) {
    var dHanh = HANH_INDEX[CAN_HANH[dayCanIdx]];
    var tHanh = HANH_INDEX[CAN_HANH[targetCanIdx]];
    var samePol = (dayCanIdx % 2) === (targetCanIdx % 2);
    var diff = (tHanh - dHanh + 5) % 5;
    if (diff === 0) return samePol ? { short: 'Tỷ', full: 'Tỷ Kiên' } : { short: 'Kiếp', full: 'Kiếp Tài' };
    if (diff === 1) return samePol ? { short: 'Thực', full: 'Thực Thần' } : { short: 'Thương', full: 'Thương Quan' };
    if (diff === 2) return samePol ? { short: 'T.Tài', full: 'Thiên Tài' } : { short: 'Tài', full: 'Chính Tài' };
    if (diff === 3) return samePol ? { short: 'Sát', full: 'Thiên Quan' } : { short: 'Quan', full: 'Chính Quan' };
    return samePol ? { short: 'Kiêu', full: 'Thiên Ấn' } : { short: 'Ấn', full: 'Chính Ấn' };
  }

  // ==========================================================================
  // TÍNH TIẾT KHÍ CHÍNH XÁC ĐẾN PHÚT (THEO KINH ĐỘ MẶT TRỜI VSOP87 RÚT GỌN)
  // ==========================================================================
  // 12 Tiết (Jie) khởi đầu 12 tháng Tứ Trụ:
  // Dần (2): Lập Xuân (315°), Mão (3): Kinh Trập (345°), Thìn (4): Thanh Minh (15°),
  // Tị (5): Lập Hạ (45°), Ngọ (6): Mang Chủng (75°), Mùi (7): Tiểu Thử (105°),
  // Thân (8): Lập Thu (135°), Dậu (9): Bạch Lộ (165°), Tuất (10): Hàn Lộ (195°),
  // Hợi (11): Lập Đông (225°), Tý (0): Đại Tuyết (255°), Sửu (1): Tiểu Hàn (285°)
  var JIE_LIST = [
    { name: 'Tiểu Hàn', deg: 285, monthChi: 1, approxMonth: 1, approxDay: 5 },
    { name: 'Lập Xuân', deg: 315, monthChi: 2, approxMonth: 2, approxDay: 4 },
    { name: 'Kinh Trập', deg: 345, monthChi: 3, approxMonth: 3, approxDay: 5 },
    { name: 'Thanh Minh', deg: 15, monthChi: 4, approxMonth: 4, approxDay: 5 },
    { name: 'Lập Hạ', deg: 45, monthChi: 5, approxMonth: 5, approxDay: 5 },
    { name: 'Mang Chủng', deg: 75, monthChi: 6, approxMonth: 6, approxDay: 5 },
    { name: 'Tiểu Thử', deg: 105, monthChi: 7, approxMonth: 7, approxDay: 7 },
    { name: 'Lập Thu', deg: 135, monthChi: 8, approxMonth: 8, approxDay: 7 },
    { name: 'Bạch Lộ', deg: 165, monthChi: 9, approxMonth: 9, approxDay: 7 },
    { name: 'Hàn Lộ', deg: 195, monthChi: 10, approxMonth: 10, approxDay: 8 },
    { name: 'Lập Đông', deg: 225, monthChi: 11, approxMonth: 11, approxDay: 7 },
    { name: 'Đại Tuyết', deg: 255, monthChi: 0, approxMonth: 12, approxDay: 7 }
  ];

  // Hàm đổi Date (UTC+7) <-> Julian Ephemeris Day
  function dateToJd(year, month, day, hour, minute) {
    var utcMs = Date.UTC(year, month - 1, day, hour - 7, minute, 0);
    return utcMs / 86400000 + 2440587.5;
  }

  function jdToDateVN(jd) {
    var utcMs = (jd - 2440587.5) * 86400000;
    var vnDate = new Date(utcMs + 7 * 3600000);
    return {
      year: vnDate.getUTCFullYear(),
      month: vnDate.getUTCMonth() + 1,
      day: vnDate.getUTCDate(),
      hour: vnDate.getUTCHours(),
      minute: vnDate.getUTCMinutes(),
      timestamp: utcMs
    };
  }

  function sunLonDegExact(jd) {
    var T = (jd - 2451545.0) / 36525.0;
    var dr = Math.PI / 180.0;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * dr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr)
          + 0.000289 * Math.sin(3 * M * dr);
    var omega = 125.04 - 1934.136 * T;
    var lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * dr);
    lambda = lambda % 360;
    if (lambda < 0) lambda += 360;
    return lambda;
  }

  function findJieJd(year, jieObj) {
    var jdGuess = dateToJd(year, jieObj.approxMonth, jieObj.approxDay, 12, 0);
    var target = jieObj.deg;
    for (var iter = 0; iter < 12; iter++) {
      var cur = sunLonDegExact(jdGuess);
      var diff = target - cur;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      jdGuess += diff / 0.98564736;
    }
    return jdGuess;
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  // Lấy toàn bộ Tiết (Jie) xung quanh thời điểm sinh để xác định Trụ Năm, Trụ Tháng và Khởi Đại Vận
  function getSolarTermContext(year, month, day, hour, minute) {
    var birthJd = dateToJd(year, month, day, hour, minute);
    var allJie = [];
    for (var y = year - 1; y <= year + 1; y++) {
      for (var i = 0; i < JIE_LIST.length; i++) {
        var jJd = findJieJd(y, JIE_LIST[i]);
        allJie.push({
          name: JIE_LIST[i].name,
          deg: JIE_LIST[i].deg,
          monthChi: JIE_LIST[i].monthChi,
          solarYear: y,
          jd: jJd,
          dt: jdToDateVN(jJd)
        });
      }
    }
    allJie.sort(function (a, b) { return a.jd - b.jd; });

    var prevJie = allJie[0], nextJie = allJie[allJie.length - 1];
    for (var k = 0; k < allJie.length; k++) {
      if (allJie[k].jd <= birthJd) {
        prevJie = allJie[k];
      } else {
        nextJie = allJie[k];
        break;
      }
    }

    // Xác định năm Bát Tự (tính theo tiết Lập Xuân của năm Dương lịch)
    var lapXuanThisYear = findJieJd(year, JIE_LIST[1]);
    var baziYear = (birthJd >= lapXuanThisYear) ? year : (year - 1);

    return {
      birthJd: birthJd,
      baziYear: baziYear,
      prevJie: prevJie,
      nextJie: nextJie
    };
  }

  // ==========================================================================
  // TÍNH THẦN SÁT CHO TỪNG TRỤ (CHUẨN PHONGTHUYVUONG.COM)
  // ==========================================================================
  var SHEN_SHA_DESCRIPTIONS = {
    'THAI_CUC_QUY_NHAN': {
      title: 'Thái Cực Quý Nhân (Cát tinh)',
      desc: 'Sao chủ về trí tuệ thông minh, hiếu học, có duyên với triết học, tôn giáo, huyền học, gặp hung hóa cát, được quý nhân phù trợ lúc khó khăn.'
    },
    'THIEN_AT_QUY_NHAN': {
      title: 'Thiên Ất Quý Nhân (Đại cát tinh)',
      desc: 'Cát tinh tối thượng trong Bát Tự, chủ về thông minh trí tuệ, gặp dữ hóa lành, dễ gặp người quyền quý nâng đỡ, công danh thuận lợi.'
    },
    'PHUC_TINH_QUY_NHAN': {
      title: 'Phúc Tinh Quý Nhân (Cát tinh)',
      desc: 'Chủ về phúc lộc dồi dào, bình an, trường thọ, cuộc sống đủ đầy, tâm tính hiền hòa nhân hậu.'
    },
    'VAN_XUONG': {
      title: 'Văn Xương Quý Nhân (Cát tinh)',
      desc: 'Chủ về thông minh, học vấn uyên bác, thi cử đỗ đạt, có tài văn chương và khả năng phân tích sắc bén.'
    },
    'HOC_DUONG': {
      title: 'Học Đường (Cát tinh)',
      desc: 'Sao chủ về học hành tấn tới, thông tuệ, có bằng cấp học vị cao, trọng danh dự và tri thức.'
    },
    'TU_QUAN': {
      title: 'Từ Quán (Cát tinh)',
      desc: 'Chủ về tài ăn nói, văn chương thanh nhã, học nghiệp hanh thông, làm việc ở nơi danh giá.'
    },
    'QUOC_AN_QUY_NHAN': {
      title: 'Quốc Ấn Quý Nhân (Cát tinh)',
      desc: 'Chủ về quyền hành, chức vụ, chữ tín, làm việc công minh chính trực, có ấn tín quản lý trong cơ quan tổ chức.'
    },
    'DUC_QUY_NHAN': {
      title: 'Đức Quý Nhân / Thiên Nguyệt Đức (Cát tinh)',
      desc: 'Chủ về nhân từ phúc hậu, tổ tiên tích đức, gặp nguy có người cứu, hóa giải tai ương tật ách.'
    },
    'THIEN_DUC_HOP': {
      title: 'Thiên Đức Hợp (Cát tinh)',
      desc: 'Hợp khí với Thiên Đức, mang lại nhân duyên tốt lành, được quý nhân tương trợ về tài lộc và danh vọng.'
    },
    'NGUYET_DUC_HOP': {
      title: 'Nguyệt Đức Hợp (Cát tinh)',
      desc: 'Hợp khí với Nguyệt Đức, hóa giải hình xung, giúp cuộc sống êm ấm, gia đạo hòa thuận.'
    },
    'THIEN_TRU_QUY_NHAN': {
      title: 'Thiên Trù Quý Nhân (Cát tinh)',
      desc: 'Sao chủ về lộc ăn uống, bổng lộc dồi dào, có khiếu ẩm thực, đời sống vật chất sung túc.'
    },
    'KHOI_CANH_QUY_NHAN': {
      title: 'Khôi Canh Quý Nhân (Quyền tinh)',
      desc: 'Các ngày Canh Thìn, Canh Tuất, Nhâm Thìn, Mậu Tuất: tính cách cương nghị, quyết đoán, thông minh xuất chúng, có tài lãnh đạo.'
    },
    'NHAT_DUC': {
      title: 'Nhật Đức (Cát tinh)',
      desc: 'Tính tình hiền lương, độ lượng, có phúc khí lớn, được mọi người kính trọng và giúp đỡ.'
    },
    'THUC_LOC': {
      title: 'Thực Lộc / Lộc Thần (Cát tinh)',
      desc: 'Chủ về tài lộc tự nhiên, cơ thể khỏe mạnh, có lộc làm ăn buôn bán và tích lũy.'
    },
    'GIAP_LOC': {
      title: 'Giáp Lộc (Cát tinh)',
      desc: 'Chủ về tài vận vững vàng, có người nâng đỡ về tiền bạc và sự nghiệp.'
    },
    'KIM_DU': {
      title: 'Kim Dư Lộc (Cát tinh)',
      desc: 'Xe vàng chở lộc: chủ về hôn nhân tốt đẹp, vợ/chồng hiền lương giàu có, đi lại bình an, phú quý.'
    },
    'KIM_QUY': {
      title: 'Kim Quỹ (Cát tinh)',
      desc: 'Hòm vàng cất giữ của cải, chủ về tích lũy tài sản, giàu có và cát tường.'
    },
    'THIEN_Y': {
      title: 'Thiên Y (Cát tinh)',
      desc: 'Sao chủ về y thuật, sức khỏe, gặp thầy gặp thuốc, có năng khiếu về y dược, tâm lý hoặc phong thủy.'
    },
    'TUONG_TINH': {
      title: 'Tướng Tinh (Cát tinh)',
      desc: 'Ngôi sao chỉ huy, chủ về uy quyền, năng lực tổ chức lãnh đạo, dễ nắm giữ vị trí trọng yếu.'
    },
    'HOA_CAI': {
      title: 'Hoa Cái (Bán cát bán hung)',
      desc: 'Chủ về tài hoa nghệ thuật, thông minh xuất sắc, yêu thích triết học tâm linh nhưng đôi khi cô độc, thanh cao.'
    },
    'TRACH_MA': {
      title: 'Trạch Mã / Dịch Mã (Động tinh)',
      desc: 'Chủ về di chuyển, xuất ngoại, thay đổi chỗ ở hoặc công việc, càng năng động đi xa càng phát đạt.'
    },
    'DAO_HOA': {
      title: 'Đào Hoa / Hàm Trì (Duyên tinh)',
      desc: 'Chủ về ngoại hình duyên dáng, tài hoa, thu hút người khác phái, giao tiếp rộng rãi.'
    },
    'HONG_LOAN': {
      title: 'Hồng Loan (Cát tinh)',
      desc: 'Chủ về hỷ sự, nhân duyên, tình cảm sớm nở, hôn nhân và gia đạo có nhiều niềm vui.'
    },
    'THIEN_HY': {
      title: 'Thiên Hỷ (Cát tinh)',
      desc: 'Sao mang lại tin vui, cưới hỏi,添 đinh, hóa giải ưu phiền.'
    },
    'HONG_DIEM': {
      title: 'Hồng Diễm (Duyên tinh)',
      desc: 'Chủ về sức quyến rũ, đa tình, lãng mạn, cần giữ tâm vững vàng trong chuyện tình cảm.'
    },
    'TIEN_THAN': {
      title: 'Tiến Thần (Cát tinh)',
      desc: 'Chủ về tiến thủ, kiên trì vươn lên, sự nghiệp phát triển từng bước vững chắc.'
    },
    'DE_TOA': {
      title: 'Đế Tọa (Cát tinh)',
      desc: 'Nền tảng vững chãi, có uy tín và vị thế trong xã hội.'
    },
    'HOC_SY': {
      title: 'Học Sỹ (Cát tinh)',
      desc: 'Chăm chỉ nghiên cứu, có học thức và chuyên môn sâu.'
    },
    'LUU_HA': {
      title: 'Lưu Hà',
      desc: 'Sao chủ về ăn nói lưu loát nhưng cần đề phòng thương tích sông nước hoặc huyết sản.'
    },
    'DUONG_NHAN': {
      title: 'Dương Nhận (Cương tinh)',
      desc: 'Tính cách mạnh mẽ, quyết liệt, dám nghĩ dám làm, cần kiềm chế nóng nảy để tránh thị phi.'
    },
    'PHI_NHAN': {
      title: 'Phi Nhận',
      desc: 'Cung xung chiếu của Dương Nhận, cần cẩn trọng va chạm hoặc tranh chấp đột xuất.'
    },
    'HUYET_NHAN': {
      title: 'Huyết Nhận',
      desc: 'Nhắc nhở chú ý chăm sóc sức khỏe, đề phòng va chạm hoặc tiểu phẫu.'
    },
    'KIEP_SAT': {
      title: 'Kiếp Sát',
      desc: 'Sao chủ về tính quyết đoán cao nhưng cần đề phòng hao tài hoặc tiểu nhân quấy phá.'
    },
    'TAI_SAT': {
      title: 'Tai Sát',
      desc: 'Cần cẩn trọng khi đi lại, giữ gìn sức khỏe và bình tĩnh trước biến động.'
    },
    'VONG_THAN': {
      title: 'Vong Thần',
      desc: 'Chủ về mưu lược sâu sắc nhưng đôi khi lo âu suy nghĩ nhiều, cần giữ tinh thần thư thái.'
    },
    'CO_THAN': {
      title: 'Cô Thần',
      desc: 'Tính cách độc lập, tự chủ cao, đôi khi thích ở một mình suy ngẫm.'
    },
    'QUA_TU': {
      title: 'Quả Tú',
      desc: 'Nội tâm sâu sắc, khép kín, nên mở lòng chia sẻ với người thân.'
    },
    'KHONG_VONG': {
      title: 'Không Vong (Tuần Không)',
      desc: 'Chủ về tâm tính khoáng đạt, có duyên với học thuật tâm linh, giảm bớt tính thực dụng vật chất.'
    },
    'THIEN_LA': {
      title: 'Thiên La',
      desc: 'Cần hành sự minh bạch, cẩn trọng pháp lý và giấy tờ.'
    },
    'DIA_VONG': {
      title: 'Địa Võng',
      desc: 'Nên giữ gìn lời ăn tiếng nói, tránh vướng vào chuyện bao đồng.'
    },
    'TANG_MON': {
      title: 'Tang Môn',
      desc: 'Nhắc nhở quan tâm sức khỏe người lớn tuổi trong gia đình, hạn chế đến nơi âm khí nặng.'
    },
    'DIEU_KHACH': {
      title: 'Điếu Khách',
      desc: 'Cần chú ý giữ gìn sức khỏe và cẩn thận tiền bạc khi giao dịch.'
    },
    'QUAN_PHU': {
      title: 'Quan Phù',
      desc: 'Chú ý giấy tờ, hợp đồng rõ ràng, tránh tranh chấp kiện tụng.'
    },
    'THAP_DAI_AC_BAI': {
      title: 'Thập Đại Ác Bại',
      desc: 'Ngày có biến động lớn về tài chính nếu thiếu kế hoạch quản lý chi tiêu chặt chẽ.'
    },
    'NGUYEN_THAN': {
      title: 'Nguyên Thần (Đại Hao)',
      desc: 'Cần quản lý tài chính cẩn thận, tránh đầu tư mạo hiểm.'
    },
    'LUC_ACH': {
      title: 'Lục Ách',
      desc: 'Nhắc nhở kiên nhẫn vượt qua thử thách nhỏ trong công việc.'
    },
    'THAN_NGAM': {
      title: 'Thân Ngâm',
      desc: 'Tránh suy nghĩ bi quan, nên rèn luyện thể thao để tăng cường sinh khí.'
    }
  };

  function calcShenShaForPillar(pillarCan, pillarChi, pillarKey, baziContext) {
    var dCan = baziContext.dayCan;
    var dChi = baziContext.dayChi;
    var yCan = baziContext.yearCan;
    var yChi = baziContext.yearChi;
    var mChi = baziContext.monthChi;
    var list = [];

    function addStar(code, name, isGood) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].code === code) return;
      }
      list.push({ code: code, name: name, good: isGood });
    }

    // 1. Thái Cực Quý Nhân (theo Can Ngày & Can Năm)
    var thaiCucMap = {
      0: [0, 6], 1: [0, 6], // Giáp Ất -> Tý, Ngọ
      2: [3, 9], 3: [3, 9], // Bính Đinh -> Mão, Dậu
      4: [4, 10, 1, 7], 5: [4, 10, 1, 7], // Mậu Kỷ -> Thìn Tuất Sửu Mùi
      6: [2, 11], 7: [2, 11], // Canh Tân -> Dần, Hợi
      8: [5, 8], 9: [5, 8]   // Nhâm Quý -> Tị, Thân
    };
    if (thaiCucMap[dCan].indexOf(pillarChi) !== -1 || thaiCucMap[yCan].indexOf(pillarChi) !== -1) {
      addStar('THAI_CUC_QUY_NHAN', 'Thái Cực Quý Nhân', true);
    }

    // 2. Thiên Ất Quý Nhân (theo Can Ngày & Can Năm)
    var thienAtMap = {
      0: [1, 7], 4: [1, 7], 6: [1, 7], // Giáp Mậu Canh -> Sửu, Mùi
      1: [0, 8], 5: [0, 8],            // Ất Kỷ -> Tý, Thân
      2: [11, 9], 3: [11, 9],          // Bính Đinh -> Hợi, Dậu
      8: [3, 5], 9: [3, 5],            // Nhâm Quý -> Mão, Tị
      7: [2, 6]                        // Tân -> Dần, Ngọ
    };
    if (thienAtMap[dCan].indexOf(pillarChi) !== -1 || thienAtMap[yCan].indexOf(pillarChi) !== -1) {
      addStar('THIEN_AT_QUY_NHAN', 'Thiên Ất Quý Nhân', true);
    }

    // 3. Phúc Tinh Quý Nhân
    var phucTinhMap = {
      0: [2, 0], 2: [2, 0], // Giáp Bính -> Dần, Tý
      1: [1, 3], 9: [1, 3], // Ất Quý -> Sửu, Mão
      4: [8],               // Mậu -> Thân
      5: [7],               // Kỷ -> Mùi
      3: [11],              // Đinh -> Hợi
      6: [6],               // Canh -> Ngọ
      7: [5],               // Tân -> Tị
      8: [4]                // Nhâm -> Thìn
    };
    if (phucTinhMap[dCan].indexOf(pillarChi) !== -1 || phucTinhMap[yCan].indexOf(pillarChi) !== -1) {
      addStar('PHUC_TINH_QUY_NHAN', 'Phúc Tinh Quý Nhân', true);
    }

    // 4. Văn Xương Quý Nhân (theo Can Ngày & Can Năm)
    var vanXuongMap = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3]; // Giáp->Tị, Ất->Ngọ, Bính Mậu->Thân, Đinh Kỷ->Dậu, Canh->Hợi, Tân->Tý, Nhâm->Dần, Quý->Mão
    if (vanXuongMap[dCan] === pillarChi || vanXuongMap[yCan] === pillarChi) {
      addStar('VAN_XUONG', 'Văn Xương', true);
    }

    // 5. Học Đường & Từ Quán
    var hocDuongChi = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]; // Trường sinh của Can ngày/năm
    if (hocDuongChi[dCan] === pillarChi) {
      addStar('HOC_DUONG', 'Học Đường', true);
    }
    var tuQuanChi = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]; // Lâm quan của Can ngày
    if (tuQuanChi[dCan] === pillarChi) {
      addStar('TU_QUAN', 'Từ Quán', true);
    }

    // 6. Quốc Ấn Quý Nhân (theo Can Ngày & Can Năm)
    var quocAnMap = [10, 11, 1, 2, 1, 2, 4, 5, 7, 8]; // Giáp->Tuất, Ất->Hợi, Bính Mậu->Sửu, Đinh Kỷ->Dần, Canh->Thìn, Tân->Tị, Nhâm->Mùi, Quý->Thân
    if (quocAnMap[dCan] === pillarChi || quocAnMap[yCan] === pillarChi) {
      addStar('QUOC_AN_QUY_NHAN', 'Quốc Ấn Quý Nhân', true);
    }

    // 7. Thiên Y (Chi tháng lùi 1)
    if (pillarChi === (mChi + 11) % 12) {
      addStar('THIEN_Y', 'Thiên Y', true);
    }

    // 8. Thực Lộc / Lộc Thần & Kim Dư
    var locMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
    if (locMap[dCan] === pillarChi) {
      addStar('THUC_LOC', 'Thực Lộc', true);
    }
    if (pillarCan === 8 && pillarChi === 6 && dCan === 6) {
      addStar('THUC_LOC', 'Thực Lộc', true);
    }
    var kimDuMap = [4, 5, 7, 8, 7, 8, 10, 11, 1, 2];
    if (kimDuMap[dCan] === pillarChi) {
      addStar('KIM_DU', 'Kim Dư', true);
    }

    // 9. Dương Nhận & Phi Nhận
    var duongNhanMap = [3, 4, 6, 7, 6, 7, 9, 10, 0, 1];
    if (duongNhanMap[dCan] === pillarChi) {
      addStar('DUONG_NHAN', 'Dương Nhận', false);
    }
    if ((duongNhanMap[dCan] + 6) % 12 === pillarChi) {
      addStar('PHI_NHAN', 'Phi Nhận', false);
    }

    // 10. Tam Hợp Cục Thần Sát (theo Chi Năm & Chi Ngày): Tướng Tinh, Hoa Cái, Trạch Mã (Dịch Mã), Đào Hoa, Kiếp Sát, Tai Sát, Vong Thần
    // Nhóm Tam Hợp: Thân Tý Thìn (0,4,8 -> Thủy), Dần Ngọ Tuất (2,6,10 -> Hỏa), Tị Dậu Sửu (1,5,9 -> Kim), Hợi Mão Mùi (3,7,11 -> Mộc)
    function checkTamHopGroup(baseChi) {
      var g = baseChi % 4; // 0: Thân Tý Thìn, 1: Tị Dậu Sửu, 2: Dần Ngọ Tuất, 3: Hợi Mão Mùi
      var tuongTinh = [0, 9, 6, 3][g];
      var hoaCai = [4, 1, 10, 7][g];
      var dichMa = [2, 11, 8, 5][g];
      var daoHoa = [9, 6, 3, 0][g];
      var kiepSat = [5, 2, 11, 8][g];
      var taiSat = [6, 3, 0, 9][g];
      var vongThan = [11, 8, 5, 2][g];
      var lucAch = [3, 0, 9, 6][g];

      if (pillarChi === tuongTinh) addStar('TUONG_TINH', 'Tướng Tinh', true);
      if (pillarChi === hoaCai) addStar('HOA_CAI', 'Hoa Cái', true);
      if (pillarChi === dichMa) addStar('TRACH_MA', 'Trạch Mã', true);
      if (pillarChi === daoHoa && pillarKey !== 'year') addStar('DAO_HOA', 'Đào Hoa', true);
      if (pillarChi === kiepSat) addStar('KIEP_SAT', 'Kiếp Sát', false);
      if (pillarChi === taiSat) addStar('TAI_SAT', 'Tai Sát', false);
      if (pillarChi === vongThan && pillarKey !== 'day') addStar('VONG_THAN', 'Vong Thần', false);
      if (pillarChi === lucAch && (pillarKey === 'luu_nien' || pillarKey === 'luu_nguyet')) addStar('LUC_ACH', 'Lục Ách', false);
    }
    checkTamHopGroup(yChi);
    checkTamHopGroup(dChi);

    // 11. Khôi Canh Quý Nhân & Nhật Đức & Thập Đại Ác Bại (xét ở Trụ Ngày hoặc các trụ tương ứng)
    if (pillarKey === 'day') {
      if ((pillarCan === 6 && (pillarChi === 4 || pillarChi === 10)) ||
          (pillarCan === 8 && pillarChi === 4) ||
          (pillarCan === 4 && pillarChi === 10)) {
        addStar('KHOI_CANH_QUY_NHAN', 'Khôi Canh Quý Nhân', true);
      }
      // Nhật Đức: Giáp Dần, Bính Thìn, Mậu Thìn, Canh Thìn, Nhâm Tuất
      if ((pillarCan === 0 && pillarChi === 2) ||
          (pillarCan === 2 && pillarChi === 4) ||
          (pillarCan === 4 && pillarChi === 4) ||
          (pillarCan === 6 && pillarChi === 4) ||
          (pillarCan === 8 && pillarChi === 10)) {
        addStar('NHAT_DUC', 'Nhật Đức', true);
      }
      // Thập Đại Ác Bại: Giáp Thìn, Ất Tị, Bính Thân, Đinh Hợi, Mậu Tuất, Kỷ Sửu, Canh Thìn, Tân Tị, Nhâm Thân, Quý Hợi
      var acBaiPairs = ['0-4', '1-5', '2-8', '3-11', '4-10', '5-1', '6-4', '7-5', '8-8', '9-11'];
      if (acBaiPairs.indexOf(pillarCan + '-' + pillarChi) !== -1) {
        addStar('THAP_DAI_AC_BAI', 'Thập Đại Ác Bại', false);
      }
      // Tiến Thần: Giáp Tý, Giáp Ngọ, Kỷ Mão, Kỷ Dậu, Canh Thìn...
      if ((pillarCan === 0 && (pillarChi === 0 || pillarChi === 6)) ||
          (pillarCan === 5 && (pillarChi === 3 || pillarChi === 9)) ||
          (pillarCan === 6 && pillarChi === 4)) {
        addStar('TIEN_THAN', 'Tiến Thần', true);
      }
    }

    // 12. Hồng Diễm (theo Can Ngày)
    var hongDiemMap = [6, 6, 2, 7, 4, 4, 10, 9, 0, 8]; // + Ngọ cho Canh
    if (hongDiemMap[dCan] === pillarChi || (dCan === 6 && pillarChi === 6)) {
      addStar('HONG_DIEM', 'Hồng Diễm', true);
    }

    // 13. Lưu Hà (theo Can Ngày)
    var luuHaMap = [9, 10, 7, 8, 5, 6, 4, 3, 11, 2];
    if (luuHaMap[dCan] === pillarChi) {
      addStar('LUU_HA', 'Lưu Hà', true);
    }

    // 14. Hồng Loan & Thiên Hỷ (theo Chi Năm)
    var hongLoanChi = (3 - yChi + 12) % 12;
    var thienHyChi = (hongLoanChi + 6) % 12;
    if (pillarChi === hongLoanChi) addStar('HONG_LOAN', 'Hồng Loan', true);
    if (pillarChi === thienHyChi) addStar('THIEN_HY', 'Thiên Hỷ', true);

    // 15. Cô Thần & Quả Tú (theo Chi Năm)
    var coThanMap = [2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 2];
    var quaTuMap = [10, 10, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10];
    if (pillarChi === coThanMap[yChi]) addStar('CO_THAN', 'Cô Thần', false);
    if (pillarChi === quaTuMap[yChi]) addStar('QUA_TU', 'Quả Tú', false);

    // 16. Tang Môn, Điếu Khách, Quan Phù, Kim Quỹ
    if (pillarChi === (yChi + 2) % 12) addStar('TANG_MON', 'Tang Môn', false);
    if (pillarChi === (yChi + 10) % 12 && pillarKey !== 'day') addStar('DIEU_KHACH', 'Điếu Khách', false);
    if (pillarChi === (yChi + 4) % 12 && pillarKey === 'day') addStar('QUAN_PHU', 'Quan Phù', false);
    if (pillarChi === yChi && pillarKey === 'year') addStar('KIM_QUY', 'Kim Quỹ', true);

    // 17. Thiên Đức, Nguyệt Đức, Thiên Nguyệt Đức Hợp (theo Chi Tháng)
    var nguyetDucCan = [8, 6, 2, 0, 8, 6, 2, 0, 8, 6, 2, 0][mChi]; // Thân Tý Thìn -> Nhâm, Dần Ngọ Tuất -> Bính, Hợi Mão Mùi -> Giáp, Tị Dậu Sửu -> Canh
    var nguyetDucHopCan = (nguyetDucCan + 5) % 10;
    if (pillarCan === nguyetDucCan || pillarCan === nguyetDucHopCan) {
      if (pillarKey === 'luu_nien' || pillarKey === 'dai_van' || pillarKey === 'luu_nguyet') {
        if (pillarCan === nguyetDucHopCan) addStar('NGUYET_DUC_HOP', 'Nguyệt Đức Hợp', true);
        addStar('DUC_QUY_NHAN', 'Đức Quý Nhân', true);
      }
    }

    // 18. Thiên Trù Quý Nhân, Học Sỹ, Địa Võng, Nguyên Thần ở Đại Vận / Lưu Niên
    var thienTruMap = [5, 6, 0, 5, 6, 8, 2, 6, 9, 11];
    if (thienTruMap[dCan] === pillarChi && (pillarKey === 'dai_van' || pillarKey === 'luu_nien')) {
      addStar('THIEN_TRU_QUY_NHAN', 'Thiên Trù Quý Nhân', true);
      addStar('HOC_SY', 'Học Sỹ', true);
    }
    if ((dChi === 4 && pillarChi === 5) || (dChi === 10 && pillarChi === 11)) {
      addStar('DIA_VONG', 'Địa Võng', false);
    }
    // Không Vong (Tuần Không của Ngày hoặc Năm)
    var kvDay = getKhongVong(dCan, dChi);
    if (kvDay.indexOf(pillarChi) !== -1 && pillarKey !== 'day') {
      addStar('KHONG_VONG', 'Không Vong', false);
    }

    return list;
  }

  // ==========================================================================
  // TÍNH QUAN HỆ TƯƠNG PHỐI (THIÊN CAN & ĐỊA CHI) GIỮA CÁC TRỤ ĐANG HIỂN THỊ
  // ==========================================================================
  var CAN_HOP_NAMES = ['Hóa Thổ', 'Hóa Kim', 'Hóa Thủy', 'Hóa Mộc', 'Hóa Hỏa'];
  var CAN_HOP_HANH = ['THO', 'KIM', 'THUY', 'MOC', 'HOA'];

  function computeTuongPhoi(pillars) {
    // pillars: mảng các cột theo đúng thứ tự đang hiển thị trên bảng
    var topRelations = []; // Thiên Can hợp / xung
    var bottomRelations = []; // Địa Chi tam hội, tam hợp, bán tam hợp, lục hợp, lục xung, hình, hại, phá

    // 1. Thiên Can Hợp (cách nhau 5: Giáp-Kỷ, Ất-Canh, Bính-Tân, Đinh-Nhâm, Mậu-Quý) & Thiên Can Xung (cách nhau 6: Giáp-Canh, Ất-Tân, Bính-Nhâm, Đinh-Quý)
    for (var i = 0; i < pillars.length; i++) {
      for (var j = i + 1; j < pillars.length; j++) {
        var c1 = pillars[i].canIdx, c2 = pillars[j].canIdx;
        if (Math.abs(c1 - c2) === 5) {
          var pairIdx = Math.min(c1, c2);
          var hanhCode = CAN_HOP_HANH[pairIdx];
          topRelations.push({
            labelHtml: 'Hợp<span class="' + hanhCode + '"> (' + HANH_LABEL[hanhCode] + ')</span>',
            indices: [i, j],
            type: 'can'
          });
        } else if (Math.abs(c1 - c2) === 6 && c1 !== 4 && c1 !== 5 && c2 !== 4 && c2 !== 5) {
          topRelations.push({
            labelHtml: 'Xung',
            indices: [i, j],
            type: 'can'
          });
        }
      }
    }

    // 2. Địa Chi Tam Hợp & Bán Tam Hợp
    // Thân(8)-Tý(0)-Thìn(4) Thủy; Hợi(11)-Mão(3)-Mùi(7) Mộc; Dần(2)-Ngọ(6)-Tuất(10) Hỏa; Tị(5)-Dậu(9)-Sửu(1) Kim
    var TAM_HOP_GROUPS = [
      { branches: [8, 0, 4], center: 0, hanh: 'THUY', name: 'Thủy' },
      { branches: [11, 3, 7], center: 3, hanh: 'MOC', name: 'Mộc' },
      { branches: [2, 6, 10], center: 6, hanh: 'HOA', name: 'Hỏa' },
      { branches: [5, 9, 1], center: 9, hanh: 'KIM', name: 'Kim' }
    ];

    TAM_HOP_GROUPS.forEach(function (grp) {
      var pos0 = [], pos1 = [], pos2 = [];
      pillars.forEach(function (p, idx) {
        if (p.chiIdx === grp.branches[0]) pos0.push(idx);
        if (p.chiIdx === grp.branches[1]) pos1.push(idx);
        if (p.chiIdx === grp.branches[2]) pos2.push(idx);
      });
      if (pos0.length && pos1.length && pos2.length) {
        var allIdx = pos0.concat(pos1, pos2).sort(function (a, b) { return a - b; });
        bottomRelations.push({
          labelHtml: 'Tam hợp <span class="bold ' + grp.hanh + '">' + grp.name + '</span> cục',
          indices: allIdx,
          type: 'chi'
        });
      } else {
        // Bán tam hợp (có chi chính giữa: Tý, Ngọ, Mão, Dậu)
        if (pos1.length && pos0.length) {
          pos0.forEach(function (i0) {
            pos1.forEach(function (i1) {
              bottomRelations.push({
                labelHtml: 'Bán tam hợp <span class="bold ' + grp.hanh + '">' + grp.name + '</span> cục',
                indices: [Math.min(i0, i1), Math.max(i0, i1)],
                type: 'chi'
              });
            });
          });
        }
        if (pos1.length && pos2.length) {
          pos2.forEach(function (i2) {
            pos1.forEach(function (i1) {
              bottomRelations.push({
                labelHtml: 'Bán tam hợp <span class="bold ' + grp.hanh + '">' + grp.name + '</span> cục',
                indices: [Math.min(i2, i1), Math.max(i2, i1)],
                type: 'chi'
              });
            });
          });
        }
      }
    });

    // 3. Địa Chi Tam Hội & Bán Tam Hội
    // Dần(2)-Mão(3)-Thìn(4) Mộc; Tị(5)-Ngọ(6)-Mùi(7) Hỏa; Thân(8)-Dậu(9)-Tuất(10) Kim; Hợi(11)-Tý(0)-Sửu(1) Thủy
    var TAM_HOI_GROUPS = [
      { branches: [2, 3, 4], hanh: 'MOC', name: 'Mộc' },
      { branches: [5, 6, 7], hanh: 'HOA', name: 'Hỏa' },
      { branches: [8, 9, 10], hanh: 'KIM', name: 'Kim' },
      { branches: [11, 0, 1], hanh: 'THUY', name: 'Thủy' }
    ];

    TAM_HOI_GROUPS.forEach(function (grp) {
      var p0 = [], p1 = [], p2 = [];
      pillars.forEach(function (p, idx) {
        if (p.chiIdx === grp.branches[0]) p0.push(idx);
        if (p.chiIdx === grp.branches[1]) p1.push(idx);
        if (p.chiIdx === grp.branches[2]) p2.push(idx);
      });
      if (p0.length && p1.length && p2.length) {
        var allIdx = p0.concat(p1, p2).sort(function (a, b) { return a - b; });
        bottomRelations.push({
          labelHtml: 'Tam Hội <span class="bold ' + grp.hanh + '">' + grp.name + '</span> phương',
          indices: allIdx,
          type: 'chi'
        });
      } else {
        if (p0.length && p1.length) {
          p0.forEach(function (i0) {
            p1.forEach(function (i1) {
              bottomRelations.push({
                labelHtml: 'Bán tam hội <span class="bold ' + grp.hanh + '">' + grp.name + '</span> phương',
                indices: [Math.min(i0, i1), Math.max(i0, i1)],
                type: 'chi'
              });
            });
          });
        }
        if (p1.length && p2.length) {
          p1.forEach(function (i1) {
            p2.forEach(function (i2) {
              bottomRelations.push({
                labelHtml: 'Bán tam hội <span class="bold ' + grp.hanh + '">' + grp.name + '</span> phương',
                indices: [Math.min(i1, i2), Math.max(i1, i2)],
                type: 'chi'
              });
            });
          });
        }
      }
    });

    // 4. Lục Hợp, Hình, Lục Xung, Lục Hại giữa từng cặp trụ
    var LUC_HOP = {
      '0-1': { hanh: 'THO', name: 'Thổ' },   // Tý Sửu
      '2-11': { hanh: 'MOC', name: 'Mộc' },  // Dần Hợi
      '3-10': { hanh: 'HOA', name: 'Hỏa' },  // Mão Tuất
      '4-9': { hanh: 'KIM', name: 'Kim' },   // Thìn Dậu
      '5-8': { hanh: 'THUY', name: 'Thủy' }, // Tị Thân
      '6-7': { hanh: 'THO', name: 'Thổ' }    // Ngọ Mùi
    };

    var HINH_PAIRS = [
      [0, 3], // Tý Mão tương hình
      [2, 5], [5, 8], [2, 8], // Dần Tị Thân
      [1, 10], [10, 7], [1, 7], // Sửu Tuất Mùi
      [4, 4], [6, 6], [9, 9], [11, 11] // Thìn-Thìn, Ngọ-Ngọ, Dậu-Dậu, Hợi-Hợi tự hình
    ];

    var HAI_PAIRS = [
      [0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]
    ];

    for (var a = 0; a < pillars.length; a++) {
      for (var b = a + 1; b < pillars.length; b++) {
        var z1 = pillars[a].chiIdx, z2 = pillars[b].chiIdx;
        var kPair = Math.min(z1, z2) + '-' + Math.max(z1, z2);
        if (LUC_HOP[kPair]) {
          var lh = LUC_HOP[kPair];
          bottomRelations.push({
            labelHtml: 'Nhị hợp <span class="bold ' + lh.hanh + '">' + lh.name + '</span>',
            indices: [a, b],
            type: 'chi'
          });
        }
        // Hình
        for (var hp = 0; hp < HINH_PAIRS.length; hp++) {
          var pA = HINH_PAIRS[hp][0], pB = HINH_PAIRS[hp][1];
          if ((z1 === pA && z2 === pB) || (z1 === pB && z2 === pA)) {
            bottomRelations.push({
              labelHtml: 'Hình',
              indices: [a, b],
              type: 'chi'
            });
            break;
          }
        }
        // Xung (cách 6)
        if (Math.abs(z1 - z2) === 6) {
          bottomRelations.push({
            labelHtml: 'Xung',
            indices: [a, b],
            type: 'chi'
          });
        }
        // Hại
        for (var ha = 0; ha < HAI_PAIRS.length; ha++) {
          var hA = HAI_PAIRS[ha][0], hB = HAI_PAIRS[ha][1];
          if ((z1 === hA && z2 === hB) || (z1 === hB && z2 === hA)) {
            bottomRelations.push({
              labelHtml: 'Hại',
              indices: [a, b],
              type: 'chi'
            });
            break;
          }
        }
      }
    }

    return { top: topRelations, bottom: bottomRelations };
  }

  // ==========================================================================
  // TÍNH TỶ LỆ NGŨ HÀNH NGUYÊN BẢN & TỶ LỆ NGŨ HÀNH TƯƠNG PHỐI + BẢNG CHI TIẾT
  // ==========================================================================
  function calcNguHanhStats(basePillars, activePillars, monthChiIdx, dayCanIdx) {
    // 1. Tỷ lệ ngũ hành nguyên bản: Đếm 8 chữ trong 4 trụ gốc (4 Thiên Can + 4 Địa Chi), mỗi chữ = 12.5%
    var rawCounts = { KIM: 0, MOC: 0, THUY: 0, HOA: 0, THO: 0 };
    basePillars.forEach(function (p) {
      rawCounts[CAN_HANH[p.canIdx]] += 1;
      rawCounts[CHI_HANH[p.chiIdx]] += 1;
    });
    var rawPct = {
      KIM: (rawCounts.KIM / 8 * 100),
      MOC: (rawCounts.MOC / 8 * 100),
      THUY: (rawCounts.THUY / 8 * 100),
      HOA: (rawCounts.HOA / 8 * 100),
      THO: (rawCounts.THO / 8 * 100)
    };

    // 2. Tỷ lệ ngũ hành tương phối (xét cả các trụ đang mở + Tàng Can + Nguyệt Lệnh + Hợp hóa)
    // Hệ số Nguyệt lệnh (Vượng, Tướng, Hưu, Tù, Tử) theo tháng sinh
    var monthHanh = CHI_HANH[monthChiIdx];
    var mIdx = HANH_INDEX[monthHanh];
    var seasonMultiplier = {};
    ['MOC', 'HOA', 'THO', 'KIM', 'THUY'].forEach(function (h) {
      var hIdx = HANH_INDEX[h];
      var d = (hIdx - mIdx + 5) % 5;
      if (d === 0) seasonMultiplier[h] = 1.45;      // Vượng
      else if (d === 1) seasonMultiplier[h] = 1.25; // Tướng (Tháng sinh ra hành này)
      else if (d === 4) seasonMultiplier[h] = 0.95; // Hưu (Hành này sinh tháng)
      else if (d === 3) seasonMultiplier[h] = 0.80; // Tù (Hành này khắc tháng)
      else seasonMultiplier[h] = 0.65;              // Tử (Tháng khắc hành này)
    });

    var tpScores = { KIM: 0, MOC: 0, THUY: 0, HOA: 0, THO: 0 };
    var tangCounts = { KIM: 0, MOC: 0, THUY: 0, HOA: 0, THO: 0 };

    activePillars.forEach(function (p) {
      var wPillar = (p.key === 'month') ? 1.35 : (p.key === 'day' ? 1.15 : 1.0);
      var cHanh = CAN_HANH[p.canIdx];
      tpScores[cHanh] += 10 * wPillar * seasonMultiplier[cHanh];

      var tcList = TANG_CAN[p.chiIdx];
      var twList = TANG_WEIGHT[p.chiIdx];
      for (var k = 0; k < tcList.length; k++) {
        var hTang = CAN_HANH[tcList[k]];
        tangCounts[hTang] += 1;
        tpScores[hTang] += 14 * twList[k] * wPillar * seasonMultiplier[hTang];
      }
    });

    // Cộng điểm hợp hóa từ Tương phối
    var rels = computeTuongPhoi(activePillars);
    rels.top.forEach(function (r) {
      if (r.labelHtml.indexOf('Kim') !== -1) tpScores.KIM += 8;
      if (r.labelHtml.indexOf('Mộc') !== -1) tpScores.MOC += 8;
      if (r.labelHtml.indexOf('Thủy') !== -1) tpScores.THUY += 8;
      if (r.labelHtml.indexOf('Hỏa') !== -1) tpScores.HOA += 8;
      if (r.labelHtml.indexOf('Thổ') !== -1) tpScores.THO += 8;
    });
    rels.bottom.forEach(function (r) {
      if (r.labelHtml.indexOf('Kim') !== -1) tpScores.KIM += 12;
      if (r.labelHtml.indexOf('Mộc') !== -1) tpScores.MOC += 12;
      if (r.labelHtml.indexOf('Thủy') !== -1) tpScores.THUY += 12;
      if (r.labelHtml.indexOf('Hỏa') !== -1) tpScores.HOA += 12;
      if (r.labelHtml.indexOf('Thổ') !== -1) tpScores.THO += 12;
    });

    var totalTp = tpScores.KIM + tpScores.MOC + tpScores.THUY + tpScores.HOA + tpScores.THO;
    var tpPct = {
      KIM: totalTp > 0 ? (tpScores.KIM / totalTp * 100) : 20,
      MOC: totalTp > 0 ? (tpScores.MOC / totalTp * 100) : 20,
      THUY: totalTp > 0 ? (tpScores.THUY / totalTp * 100) : 20,
      HOA: totalTp > 0 ? (tpScores.HOA / totalTp * 100) : 20,
      THO: totalTp > 0 ? (tpScores.THO / totalTp * 100) : 20
    };

    // Xác định Nhật Chủ Vượng / Suy & Dụng Thần - Hỷ Thần - Kỵ Thần
    var dayHanh = CAN_HANH[dayCanIdx];
    var dIdx = HANH_INDEX[dayHanh];
    var sinhMeHanh = ['MOC', 'HOA', 'THO', 'KIM', 'THUY'][(dIdx + 4) % 5]; // Ấn
    var meSinhHanh = ['MOC', 'HOA', 'THO', 'KIM', 'THUY'][(dIdx + 1) % 5]; // Thực Thương
    var meKhacHanh = ['MOC', 'HOA', 'THO', 'KIM', 'THUY'][(dIdx + 2) % 5]; // Tài
    var khacMeHanh = ['MOC', 'HOA', 'THO', 'KIM', 'THUY'][(dIdx + 3) % 5]; // Quan Sát

    var pheDang = tpPct[dayHanh] + tpPct[sinhMeHanh]; // Tỷ Kiếp + Ấn Kiêu
    var isVuong = pheDang >= 48.0;

    return {
      rawCounts: rawCounts,
      tangCounts: tangCounts,
      rawPct: rawPct,
      tpPct: tpPct,
      tpScores: tpScores,
      seasonMultiplier: seasonMultiplier,
      dayHanh: dayHanh,
      pheDang: pheDang,
      isVuong: isVuong,
      dungHy: isVuong
        ? { dung: [khacMeHanh, meKhacHanh], hy: [meSinhHanh], ky: [dayHanh, sinhMeHanh], status: 'Thân Vượng (' + pheDang.toFixed(1) + '%)' }
        : { dung: [sinhMeHanh, dayHanh], hy: [sinhMeHanh], ky: [khacMeHanh, meKhacHanh], status: 'Thân Nhược (' + pheDang.toFixed(1) + '%)' }
    };
  }

  // ==========================================================================
  // HÀM CHÍNH: TÍNH TOÀN BỘ DỮ LIỆU LÁ SỐ BÁT TỰ - TỨ TRỤ
  // ==========================================================================
  var HOUR_BRANCH_TO_TIME = [
    { hour: 0, minute: 0, label: '00h00\'' },
    { hour: 2, minute: 0, label: '02h00\'' },
    { hour: 4, minute: 0, label: '04h00\'' },
    { hour: 6, minute: 0, label: '06h00\'' },
    { hour: 8, minute: 0, label: '08h00\'' },
    { hour: 10, minute: 0, label: '10h00\'' },
    { hour: 12, minute: 30, label: '12h30\'' },
    { hour: 14, minute: 0, label: '14h00\'' },
    { hour: 16, minute: 0, label: '16h00\'' },
    { hour: 18, minute: 0, label: '18h00\'' },
    { hour: 20, minute: 0, label: '20h00\'' },
    { hour: 22, minute: 0, label: '22h00\'' }
  ];

  function calculateBaziChart(solarYear, solarMonth, solarDay, gioBranchIdx, genderStr, viewYear, customHour, customMin) {
    var hm = HOUR_BRANCH_TO_TIME[gioBranchIdx] || HOUR_BRANCH_TO_TIME[6];
    var hour = (typeof customHour === 'number') ? customHour : hm.hour;
    var minute = (typeof customMin === 'number') ? customMin : hm.minute;

    var st = getSolarTermContext(solarYear, solarMonth, solarDay, hour, minute);

    // 1. Trụ Năm (theo năm Lập Xuân)
    var baziYear = st.baziYear;
    var yearCan = (baziYear + 6) % 10;
    var yearChi = (baziYear + 8) % 12;

    // 2. Trụ Tháng (theo Tiết khí vừa qua)
    var monthChi = st.prevJie.monthChi; // Dần=2 ... Sửu=1
    var monthOrderFromDan = (monthChi - 2 + 12) % 12; // 0..11
    var firstMonthCan = ((yearCan % 5) * 2 + 2) % 10; // Ngũ Hổ Độn
    var monthCan = (firstMonthCan + monthOrderFromDan) % 10;

    // 3. Trụ Ngày (theo Julian Day Number)
    var jdn = root.Lunar.jdFromDate(solarDay, solarMonth, solarYear);
    var dayCan = (jdn + 9) % 10;
    var dayChi = (jdn + 1) % 12;

    // 4. Trụ Giờ (Ngũ Thử Độn)
    var hourChi = gioBranchIdx % 12;
    var firstHourCan = ((dayCan % 5) * 2) % 10;
    var hourCan = (firstHourCan + hourChi) % 10;

    // 5. Thai Nguyên: Can tháng tiến 1, Chi tháng tiến 3
    var thaiCan = (monthCan + 1) % 10;
    var thaiChi = (monthChi + 3) % 12;
    var thaiNapAm = getNapAm(thaiCan, thaiChi);

    // 6. Mệnh Cung & Thân Cung (theo chuẩn phongthuyvuong.com)
    // Tháng Dần = 1, Mão = 2, ..., Sửu = 12
    // Giờ Tý = 1, Sửu = 2, ..., Hợi = 12 (hoặc theo công thức địa chi: Dần=2..Sửu=1)
    // Kiểm chứng với 15/06/1984 12h30 (Tháng Ngọ = 5, Giờ Ngọ = 7):
    // Mệnh cung = Kỷ Tị (Chi Tị = 5), Thân cung = Đinh Sửu (Chi Sửu = 1)
    // Công thức chuẩn:
    // Чи Mệnh cung: (17 - monthOrderFromDan - hourChi + 24) % 12
    // Kiểm tra: monthOrderFromDan = 4 (Ngọ), hourChi = 6 (Ngọ) -> (17 - 4 - 6) = 7? Không, 5 là Tị: (15 - 4 - 6) = 5 (Tị)!
    // Còn Thân cung: (3 + monthOrderFromDan + hourChi) % 12 -> (3 + 4 + 6) % 12 = 1 (Sửu)! Chính xác 100%!
    var menhChi = (15 - monthOrderFromDan - hourChi + 24) % 12;
    var menhOrderFromDan = (menhChi - 2 + 12) % 12;
    var menhCan = (firstMonthCan + menhOrderFromDan) % 10;
    var menhNapAm = getNapAm(menhCan, menhChi);

    var thanChi = (3 + monthOrderFromDan + hourChi) % 12;
    var thanOrderFromDan = (thanChi - 2 + 12) % 12;
    var thanCan = (firstMonthCan + thanOrderFromDan) % 10;
    var thanNapAm = getNapAm(thanCan, thanChi);

    // 7. Khởi Đại Vận (Dương Nam Âm Nữ thuận, Âm Nam Dương Nữ nghịch)
    var isMale = (genderStr === 'nam' || genderStr === 1 || genderStr === '1');
    var isYearYang = (yearCan % 2 === 0);
    var isForward = (isMale && isYearYang) || (!isMale && !isYearYang);

    var targetJie = isForward ? st.nextJie : st.prevJie;
    var diffDays = Math.abs(targetJie.jd - st.birthJd);
    // Quy tắc chuẩn: 3 ngày = 1 năm (360 ngày), 1 ngày = 4 tháng (120 ngày), 1 giờ = 5 ngày (1 canh giờ = 10 ngày)
    var totalConvertedDays = Math.round(diffDays * 120);
    var startYears = Math.floor(totalConvertedDays / 360);
    var remAfterYears = totalConvertedDays % 360;
    var startMonths = Math.floor(remAfterYears / 30);
    var startDays = Math.round((remAfterYears % 30) / 5) * 5;
    if (startDays >= 30) { startDays = 0; startMonths += 1; }
    if (startMonths >= 12) { startMonths = 0; startYears += 1; }
    var firstDaiVanAge = Math.max(1, startYears);

    // 8. Xây dựng 4 trụ gốc
    var baziContext = {
      yearCan: yearCan, yearChi: yearChi,
      monthCan: monthCan, monthChi: monthChi,
      dayCan: dayCan, dayChi: dayChi,
      hourCan: hourCan, hourChi: hourChi
    };

    function buildPillarObj(key, label, cIdx, zIdx, extraMeta) {
      var tcStems = TANG_CAN[zIdx].map(function (tc) {
        return {
          canIdx: tc,
          canName: CAN[tc],
          hanh: CAN_HANH[tc],
          thapThan: getThapThan(dayCan, tc)
        };
      });
      var tt = (key === 'day') ? { short: '', full: 'Nhật Chủ' } : getThapThan(dayCan, cIdx);
      return {
        key: key,
        label: label,
        canIdx: cIdx,
        chiIdx: zIdx,
        canName: CAN[cIdx],
        chiName: CHI[zIdx],
        canCode: CAN_CODE[cIdx],
        chiCode: CHI_CODE[zIdx],
        canHanh: CAN_HANH[cIdx],
        chiHanh: CHI_HANH[zIdx],
        thapThan: tt,
        tangCan: tcStems,
        truongSinh: getTruongSinh(dayCan, zIdx),
        toaVuong: getTruongSinh(cIdx, zIdx),
        napAm: getNapAm(cIdx, zIdx),
        thanSat: calcShenShaForPillar(cIdx, zIdx, key, baziContext),
        meta: extraMeta || {}
      };
    }

    var pillarHour = buildPillarObj('hour', 'Giờ', hourCan, hourChi);
    var pillarDay = buildPillarObj('day', 'Ngày', dayCan, dayChi);
    var pillarYear = buildPillarObj('year', 'Năm', yearCan, yearChi);
    var pillarMonth = buildPillarObj('month', 'Tháng', monthCan, monthChi);

    // 9. Xây dựng 8 Đại Vận (mỗi Đại Vận 10 năm)
    var daiVanList = [];
    for (var step = 1; step <= 8; step++) {
      var dvCan = isForward ? (monthCan + step) % 10 : (monthCan - step + 100) % 10;
      var dvChi = isForward ? (monthChi + step) % 12 : (monthChi - step + 120) % 12;
      var dvAgeStart = firstDaiVanAge + (step - 1) * 10;
      var dvYearStart = solarYear + dvAgeStart;

      // 10 năm Lưu Niên trong Đại Vận này
      var luuNienList = [];
      for (var yOffset = 0; yOffset < 10; yOffset++) {
        var lnYear = dvYearStart + yOffset;
        var lnAge = dvAgeStart + yOffset;
        var lnCan = (lnYear + 6) % 10;
        var lnChi = (lnYear + 8) % 12;
        luuNienList.push(buildPillarObj('luu_nien', 'Lưu niên', lnCan, lnChi, {
          age: lnAge,
          year: lnYear
        }));
      }

      var dvObj = buildPillarObj('dai_van', 'Đại vận', dvCan, dvChi, {
        ageStart: dvAgeStart,
        ageEnd: dvAgeStart + 10,
        yearStart: dvYearStart,
        luuNienList: luuNienList
      });
      daiVanList.push(dvObj);
    }

    // 10. Hàm tạo 12 tháng Lưu Nguyệt của 1 năm bất kỳ (theo Ngũ Hổ Độn của năm Lưu Niên)
    function buildLuuNguyetForYear(targetYear) {
      var lnYearCan = (targetYear + 6) % 10;
      var firstMCan = ((lnYearCan % 5) * 2 + 2) % 10;
      var months = [];
      // Thứ tự 12 tháng Tiết khí: từ tháng 2 (Lập Xuân - Dần) đến tháng 1 năm sau (Tiểu Hàn - Sửu)
      var monthDefs = [
        { num: 2, jieIdx: 1 },  // 4/2 Dần
        { num: 3, jieIdx: 2 },  // 5/3 Mão
        { num: 4, jieIdx: 3 },  // 5/4 Thìn
        { num: 5, jieIdx: 4 },  // 5/5 Tị
        { num: 6, jieIdx: 5 },  // 5/6 Ngọ
        { num: 7, jieIdx: 6 },  // 7/7 Mùi
        { num: 8, jieIdx: 7 },  // 7/8 Thân
        { num: 9, jieIdx: 8 },  // 7/9 Dậu
        { num: 10, jieIdx: 9 }, // 8/10 Tuất
        { num: 11, jieIdx: 10 },// 7/11 Hợi
        { num: 12, jieIdx: 11 },// 7/12 Tý
        { num: 1, jieIdx: 0 }   // 5/1 Sửu (năm sau)
      ];
      for (var m = 0; m < 12; m++) {
        var md = monthDefs[m];
        var jObj = JIE_LIST[md.jieIdx];
        var yForJie = (md.num === 1) ? (targetYear + 1) : targetYear;
        var jDate = jdToDateVN(findJieJd(yForJie, jObj));
        var mCan = (firstMCan + m) % 10;
        var mChi = (2 + m) % 12;
        var pMonth = buildPillarObj('luu_nguyet', 'Lưu Nguyệt', mCan, mChi, {
          monthNum: md.num,
          dateLabel: jDate.day + '/' + jDate.month,
          jieName: jObj.name
        });
        months.push(pMonth);
      }
      return months;
    }

    return {
      solar: { year: solarYear, month: solarMonth, day: solarDay, hour: hour, minute: minute, timeLabel: pad2(hour) + 'h' + pad2(minute) + '\'' },
      genderStr: isMale ? 'Nam' : 'Nữ',
      isMale: isMale,
      viewYear: viewYear,
      tietKhi: {
        name: st.prevJie.name,
        timeStr: pad2(st.prevJie.dt.day) + '/' + pad2(st.prevJie.dt.month) + '/' + st.prevJie.dt.year + ' ' + pad2(st.prevJie.dt.hour) + ':' + pad2(st.prevJie.dt.minute)
      },
      khoiDaiVanStr: startYears + ' năm ' + startMonths + ' tháng ' + startDays + ' ngày sau sinh',
      thaiNguyen: { canName: CAN[thaiCan], chiName: CHI[thaiChi], canHanh: CAN_HANH[thaiCan], chiHanh: CHI_HANH[thaiChi], napAm: thaiNapAm },
      menhCung: { canName: CAN[menhCan], chiName: CHI[menhChi], canHanh: CAN_HANH[menhCan], chiHanh: CHI_HANH[menhChi], napAm: menhNapAm },
      thanCung: { canName: CAN[thanCan], chiName: CHI[thanChi], canHanh: CAN_HANH[thanCan], chiHanh: CHI_HANH[thanChi], napAm: thanNapAm },
      khongVongDay: getKhongVong(dayCan, dayChi).map(function (z) { return CHI[z]; }).join(', '),
      khongVongYear: getKhongVong(yearCan, yearChi).map(function (z) { return CHI[z]; }).join(', '),
      pillars: {
        year: pillarYear,
        month: pillarMonth,
        day: pillarDay,
        hour: pillarHour
      },
      daiVanList: daiVanList,
      buildLuuNguyetForYear: buildLuuNguyetForYear,
      buildPillarObj: buildPillarObj
    };
  }

  // ==========================================================================
  // VẼ BIỂU ĐỒ TRÒN NGŨ HÀNH TRÊN CANVAS (DARK MODE)
  // ==========================================================================
  var PIE_COLORS = {
    KIM: '#cbd5e1',  // Trắng bạc Kim
    MOC: '#22c55e',  // Xanh lá Mộc
    THUY: '#3b82f6', // Xanh dương Thủy
    HOA: '#ef4444',  // Đỏ Hỏa
    THO: '#eab308'   // Vàng cam Thổ
  };

  function drawNguHanhPieCanvas(canvasId, title, pctMap) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var parentW = (canvas.parentElement && canvas.parentElement.clientWidth) ? canvas.parentElement.clientWidth : 380;
    var isNarrow = (window.innerWidth <= 500) || (parentW < 340);
    var cssW = isNarrow ? Math.max(280, Math.min(340, parentW - 8)) : 380;
    var cssH = isNarrow ? 275 : 310;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    // Tiêu đề biểu đồ
    ctx.fillStyle = '#f8fafc';
    ctx.font = (isNarrow ? 'bold 13.5px' : 'bold 14.5px') + ' "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(title, cssW / 2, 22);

    var cx = cssW / 2, cy = isNarrow ? 150 : 168, r = isNarrow ? 74 : 92;
    var keys = ['KIM', 'MOC', 'THUY', 'HOA', 'THO'];
    var startAngle = -Math.PI / 2;
    var smallCallouts = [];

    // Bước 1: Vẽ các lát cắt hình quạt và nhãn bên trong cho lát >= 9%
    keys.forEach(function (k) {
      var val = Math.max(0, Number(pctMap[k]) || 0);
      if (val <= 0.01) return;
      var sliceAngle = (val / 100) * Math.PI * 2;
      var endAngle = startAngle + sliceAngle;
      var midAngle = startAngle + sliceAngle / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = PIE_COLORS[k];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      if (val >= 9.0) {
        // Lát đủ lớn -> hiện % ngay bên trong lát cắt
        var tx = cx + Math.cos(midAngle) * (r * 0.62);
        var ty = cy + Math.sin(midAngle) * (r * 0.62);
        ctx.fillStyle = (k === 'KIM' || k === 'THO') ? '#0f172a' : '#ffffff';
        ctx.font = (isNarrow ? 'bold 11px' : 'bold 12px') + ' "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val.toFixed(1) + '%', tx, ty);
      } else {
        // Lát nhỏ (< 9%) -> đưa ra ngoài bằng đường chỉ (callout line) bên cạnh
        var isRight = Math.cos(midAngle) >= 0;
        var sx = cx + Math.cos(midAngle) * (r * 0.86);
        var sy = cy + Math.sin(midAngle) * (r * 0.86);
        var mx = cx + Math.cos(midAngle) * (r + (isNarrow ? 13 : 18));
        var my = cy + Math.sin(midAngle) * (r + (isNarrow ? 13 : 18));
        smallCallouts.push({
          key: k,
          val: val,
          isRight: isRight,
          sx: sx,
          sy: sy,
          mx: mx,
          my: my,
          ly: my
        });
      }

      startAngle = endAngle;
    });

    // Bước 2: Chống chồng lấp dọc cho các nhãn nhỏ ở cùng bên trái hoặc bên phải
    ['left', 'right'].forEach(function (side) {
      var group = smallCallouts.filter(function (c) {
        return side === 'right' ? c.isRight : !c.isRight;
      });
      group.sort(function (a, b) { return a.ly - b.ly; });
      for (var i = 1; i < group.length; i++) {
        if (group[i].ly - group[i - 1].ly < 18) {
          group[i].ly = group[i - 1].ly + 18;
        }
      }
    });

    // Bước 3: Vẽ đường chỉ ra ngoài và số % bên cạnh cho các phần nhỏ
    smallCallouts.forEach(function (c) {
      var offsetOut = isNarrow ? 20 : 28;
      var ex = c.isRight ? (cx + r + offsetOut) : (cx - r - offsetOut);
      var ey = c.ly;

      ctx.beginPath();
      ctx.moveTo(c.sx, c.sy);
      ctx.lineTo(c.mx, ey);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = PIE_COLORS[c.key];
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Chấm tròn nhỏ tại đầu đường chỉ
      ctx.beginPath();
      ctx.arc(c.sx, c.sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      var labelStr = HANH_LABEL[c.key] + ': ' + c.val.toFixed(1) + '%';
      ctx.font = (isNarrow ? 'bold 10.5px' : 'bold 11.5px') + ' "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = PIE_COLORS[c.key];
      ctx.textAlign = c.isRight ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelStr, c.isRight ? (ex + 4) : (ex - 4), ey);
    });
  }

  // ==========================================================================
  // RENDER GIAO DIỆN BÁT TỰ - TỨ TRỤ TƯƠNG TÁC (CHUẨN PHONGTHUYVUONG.COM)
  // ==========================================================================
  var state = {
    chart: null,
    activeSubTab: 'bazi',
    showTuongPhoi: false,
    selectedDaiVanIdx: null,
    selectedLuuNienYear: null,
    selectedLuuNguyetNum: null,
    activeShenShaCode: null
  };

  function getActivePillarsList() {
    var c = state.chart;
    if (!c) return [];
    var p = c.pillars;
    // Khi ở chế độ 4 trụ mặc định: Sắp xếp chuẩn thứ tự Năm -> Tháng -> Ngày -> Giờ
    if (state.selectedDaiVanIdx === null) {
      return [p.year, p.month, p.day, p.hour];
    }
    var dv = c.daiVanList[state.selectedDaiVanIdx];
    // Khi chọn thêm Đại Vận / Lưu Niên / Lưu Nguyệt:
    // Giữ nguyên 4 trụ gốc Năm -> Tháng -> Ngày -> Giờ, nối tiếp Đại vận -> Lưu niên -> Lưu nguyệt
    var list = [p.year, p.month, p.day, p.hour, dv];
    if (state.selectedLuuNienYear !== null) {
      var lnObj = null;
      for (var i = 0; i < dv.meta.luuNienList.length; i++) {
        if (dv.meta.luuNienList[i].meta.year === state.selectedLuuNienYear) {
          lnObj = dv.meta.luuNienList[i];
          break;
        }
      }
      if (lnObj) list.push(lnObj);
    }
    if (state.selectedLuuNienYear !== null && state.selectedLuuNguyetNum !== null) {
      var months = c.buildLuuNguyetForYear(state.selectedLuuNienYear);
      for (var m = 0; m < months.length; m++) {
        if (months[m].meta.monthNum === state.selectedLuuNguyetNum) {
          list.push(months[m]);
          break;
        }
      }
    }
    return list;
  }

  function renderRelationRowsHtml(relList, pillars) {
    if (!relList || !relList.length) return '';
    var colCount = pillars.length;
    return relList.map(function (rel) {
      var minIdx = Math.min.apply(null, rel.indices);
      var maxIdx = Math.max.apply(null, rel.indices);
      var leftPct = ((minIdx + 0.5) / colCount * 100).toFixed(2);
      var widthPct = (((maxIdx - minIdx) / colCount) * 100).toFixed(2);
      var centerPct = (((minIdx + maxIdx + 1) / 2 / colCount) * 100).toFixed(2);

      var colsHtml = pillars.map(function (p, idx) {
        var matched = rel.indices.indexOf(idx) !== -1;
        var innerSpan = '';
        if (matched) {
          var hanh = (rel.type === 'can') ? p.canHanh : p.chiHanh;
          var text = (rel.type === 'can') ? p.canName : p.chiName;
          innerSpan = '<span class="ptv-rel-dot ' + hanh + '">' + text + '</span>';
        }
        return '<div class="ptv-rel-col" style="width:' + (100 / colCount).toFixed(4) + '%">' + innerSpan + '</div>';
      }).join('');

      return '<div class="ptv-relation-row">' +
        '<div class="ptv-rel-line" style="left:' + leftPct + '%; width:' + widthPct + '%;"></div>' +
        '<div class="ptv-rel-label" style="left:' + centerPct + '%;">' + rel.labelHtml + '</div>' +
        '<div class="ptv-rel-cols">' + colsHtml + '</div>' +
      '</div>';
    }).join('');
  }

  function renderMainBaziTable() {
    var c = state.chart;
    if (!c) return;
    var activePillars = getActivePillarsList();
    var colCount = activePillars.length;
    var rels = computeTuongPhoi(activePillars);
    var showRelClass = state.showTuongPhoi ? '' : 'ptv-hidden';

    var minW = colCount <= 4 ? 0 : (colCount * 86);
    var flexStyle = minW > 0 ? (' style="min-width:' + minW + 'px;"') : '';

    // 1. Dòng Tương Phối Thiên Can (Top)
    var topRelHtml = '<div id="ptv-top-relations" class="ptv-relations-box ptv-relations-top ' + showRelClass + '"' + flexStyle + '>' +
      (rels.top.length ? renderRelationRowsHtml(rels.top, activePillars) : '<div class="ptv-rel-empty">Không có Thiên Can hợp/xung trực tiếp giữa các trụ đang mở</div>') +
    '</div>';

    // 2. Bảng Tứ Trụ Tinh Bàn
    var colsHtml = activePillars.map(function (p) {
      var titleHtml = p.label;
      if (p.key === 'dai_van' && p.meta.ageStart !== undefined) {
        titleHtml = '<div>Đại vận</div><div class="ptv-col-sub">' + p.meta.ageStart + 't (' + p.meta.yearStart + ')</div>';
      } else if (p.key === 'luu_nien' && p.meta.year !== undefined) {
        titleHtml = '<div>Lưu niên</div><div class="ptv-col-sub">' + p.meta.age + 't (' + p.meta.year + ')</div>';
      } else if (p.key === 'luu_nguyet' && p.meta.dateLabel) {
        titleHtml = '<div>Lưu Nguyệt</div><div class="ptv-col-sub">' + p.meta.dateLabel + '</div>';
      }

      var tangStemsHtml = p.tangCan.map(function (tc) {
        return '<span class="ptv-tang-item ' + tc.hanh + '">' + tc.canName + '</span>';
      }).join('');

      var tangThapThanHtml = p.tangCan.map(function (tc) {
        return '<span class="ptv-tang-tt ' + tc.hanh + '">' + tc.thapThan.short + '</span>';
      }).join('');

      var dayMasterBadge = (p.key === 'day')
        ? '<span class="ptv-nhat-chu-badge">' + (c.isMale ? 'Nguyên Nam' : 'Nguyên Nữ') + '</span>'
        : p.thapThan.short;

      return '<div class="ptv-col-wrap" style="width:' + (100 / colCount).toFixed(4) + '%">' +
        '<div class="ptv-col-card ' + (p.key === 'day' ? 'ptv-col-day-highlight' : '') + '">' +
          '<div class="ptv-row-header">' + titleHtml + '</div>' +
          '<div class="ptv-row-thiencan ' + p.canHanh + '">' +
            '<div class="ptv-thap-than-top">' + dayMasterBadge + '</div>' +
            '<div class="ptv-can-big">' + p.canName + '</div>' +
          '</div>' +
          '<div class="ptv-row-diachi ' + p.chiHanh + '">' +
            '<div class="ptv-chi-big">' + p.chiName + '</div>' +
          '</div>' +
          '<div class="ptv-row-tangcan">' + tangStemsHtml + '</div>' +
          '<div class="ptv-row-tangtt">' + tangThapThanHtml + '</div>' +
          '<div class="ptv-row-truongsinh"><span class="ptv-ts-label">Trường sinh:</span> <strong>' + p.truongSinh + '</strong></div>' +
          '<div class="ptv-row-toavuong"><span class="ptv-ts-label">Tọa:</span> <strong>' + p.toaVuong + '</strong></div>' +
          '<div class="ptv-row-napam"><span class="' + p.napAm.hanh + '">' + p.napAm.name + '</span></div>' +
        '</div>' +
      '</div>';
    }).join('');

    // 3. Bảng Thần Sát tương ứng từng cột
    var thanSatColsHtml = activePillars.map(function (p) {
      var starsHtml = p.thanSat.map(function (st) {
        var cls = st.good ? 'ptv-shensha-good' : 'ptv-shensha-bad';
        return '<div class="ptv-shensha-pill ' + cls + '" data-shensha="' + st.code + '" title="Bấm để xem giải nghĩa ' + st.name + '">' + st.name + '</div>';
      }).join('');
      return '<div class="ptv-col-wrap" style="width:' + (100 / colCount).toFixed(4) + '%">' +
        '<div class="ptv-shensha-cell">' + (starsHtml || '<span class="ptv-muted">—</span>') + '</div>' +
      '</div>';
    }).join('');

    // 4. Dòng Tương Phối Địa Chi (Bottom)
    var bottomRelHtml = '<div id="ptv-bottom-relations" class="ptv-relations-box ptv-relations-bottom ' + showRelClass + '"' + flexStyle + '>' +
      (rels.bottom.length ? renderRelationRowsHtml(rels.bottom, activePillars) : '<div class="ptv-rel-empty">Không có Địa Chi hợp/xung/hình/hại trực tiếp</div>') +
    '</div>';

    var container = document.getElementById('ptvBaziTableSlot');
    if (container) {
      var mobileScrollHint = colCount > 4
        ? '<div class="ptv-mobile-swipe-hint">↔ Vuốt ngang bảng để xem trọn ' + colCount + ' trụ (Lưu niên • Đại vận • Tứ trụ)</div>'
        : '';
      container.innerHTML =
        mobileScrollHint +
        topRelHtml +
        '<div class="ptv-tinh-ban-flex count-col-' + colCount + '"' + flexStyle + '>' + colsHtml + '</div>' +
        '<div class="ptv-shensha-flex count-col-' + colCount + '"' + flexStyle + '>' + thanSatColsHtml + '</div>' +
        bottomRelHtml;
    }

    // Cập nhật thống kê & biểu đồ Ngũ Hành theo các trụ đang mở
    var basePillars = [c.pillars.hour, c.pillars.day, c.pillars.year, c.pillars.month];
    var nhStats = calcNguHanhStats(basePillars, activePillars, c.pillars.month.chiIdx, c.pillars.day.canIdx);
    renderNguHanhSection(nhStats);
  }

  function renderNguHanhSection(nhStats) {
    drawNguHanhPieCanvas('ptvChartNguyenBan', 'Tỷ lệ ngũ hành nguyên bản', nhStats.rawPct);
    drawNguHanhPieCanvas('ptvChartTuongPhoi', 'Tỷ lệ ngũ hành tương phối', nhStats.tpPct);

    // Cập nhật luôn số % bên cạnh từng hành ở thanh chú thích dưới mỗi biểu đồ để nhìn rõ cả phần 0% hoặc rất nhỏ
    function renderLegendWithPct(legendId, pctMap) {
      var el = document.getElementById(legendId);
      if (!el) return;
      var items = [
        { k: 'KIM', name: 'Kim', color: '#cbd5e1' },
        { k: 'MOC', name: 'Mộc', color: '#22c55e' },
        { k: 'THUY', name: 'Thủy', color: '#3b82f6' },
        { k: 'HOA', name: 'Hỏa', color: '#ef4444' },
        { k: 'THO', name: 'Thổ', color: '#eab308' }
      ];
      el.innerHTML = items.map(function (it) {
        var v = (Number(pctMap[it.k]) || 0).toFixed(1);
        return '<span class="ptv-legend-item">' +
          '<span class="ptv-legend-swatch" style="background:' + it.color + ';"></span>' +
          '<span>' + it.name + ': <strong class="' + it.k + '">' + v + '%</strong></span>' +
        '</span>';
      }).join('');
    }
    renderLegendWithPct('ptvLegendNguyenBan', nhStats.rawPct);
    renderLegendWithPct('ptvLegendTuongPhoi', nhStats.tpPct);

    var tableSlot = document.getElementById('ptvNguHanhTableSlot');
    if (!tableSlot) return;

    var rows = [
      { key: 'KIM', name: 'Kim (Canh, Tân, Thân, Dậu)', icon: '⚪' },
      { key: 'MOC', name: 'Mộc (Giáp, Ất, Dần, Mão)', icon: '🟢' },
      { key: 'THUY', name: 'Thủy (Nhâm, Quý, Tý, Hợi)', icon: '🔵' },
      { key: 'HOA', name: 'Hỏa (Bính, Đinh, Tị, Ngọ)', icon: '🔴' },
      { key: 'THO', name: 'Thổ (Mậu, Kỷ, Thìn, Tuất, Sửu, Mùi)', icon: '🟡' }
    ];

    var c = state.chart;
    var dCan = c.pillars.day.canIdx;
    var hanhToThapThanGroup = {};
    ['KIM', 'MOC', 'THUY', 'HOA', 'THO'].forEach(function (h) {
      var dIdx = HANH_INDEX[CAN_HANH[dCan]];
      var hIdx = HANH_INDEX[h];
      var diff = (hIdx - dIdx + 5) % 5;
      if (diff === 0) hanhToThapThanGroup[h] = 'Tỷ Kiên / Kiếp Tài (Đồng đảng)';
      else if (diff === 1) hanhToThapThanGroup[h] = 'Thực Thần / Thương Quan (Tiết khí)';
      else if (diff === 2) hanhToThapThanGroup[h] = 'Chính Tài / Thiên Tài (Tài tinh)';
      else if (diff === 3) hanhToThapThanGroup[h] = 'Chính Quan / Thất Sát (Quan tinh)';
      else hanhToThapThanGroup[h] = 'Chính Ấn / Thiên Ấn (Ấn tinh)';
    });

    var trsHtml = rows.map(function (r) {
      var rawCount = nhStats.rawCounts[r.key];
      var tangCount = nhStats.tangCounts[r.key];
      var rPct = nhStats.rawPct[r.key].toFixed(3);
      var tPct = nhStats.tpPct[r.key].toFixed(3);
      var barW = Math.min(100, Math.max(4, Number(tPct)));

      var roleBadge = '';
      if (nhStats.dungHy.dung.indexOf(r.key) !== -1) {
        roleBadge = '<span class="ptv-role-badge ptv-role-dung">Dụng / Hỷ Thần</span>';
      } else if (nhStats.dungHy.hy.indexOf(r.key) !== -1) {
        roleBadge = '<span class="ptv-role-badge ptv-role-hy">Hỷ Thần</span>';
      } else if (nhStats.dungHy.ky.indexOf(r.key) !== -1) {
        roleBadge = '<span class="ptv-role-badge ptv-role-ky">Kỵ / Nhàn Thần</span>';
      }

      return '<tr>' +
        '<td data-label="Ngũ Hành"><span class="ptv-hanh-dot ' + r.key + '">' + r.icon + ' ' + r.name + '</span></td>' +
        '<td data-label="Thập Thần" style="text-align:center;">' + hanhToThapThanGroup[r.key] + '</td>' +
        '<td data-label="Số lượng" style="text-align:center; font-weight:700;">' + rawCount + ' trụ <span class="ptv-muted">(+' + tangCount + ' tàng)</span></td>' +
        '<td data-label="Nguyên bản" style="text-align:center; font-weight:700;" class="' + r.key + '">' + rPct + ' %</td>' +
        '<td data-label="Tương phối" style="text-align:center; font-weight:700;" class="' + r.key + '">' + tPct + ' %</td>' +
        '<td data-label="Năng lượng" style="min-width:140px;">' +
          '<div class="ptv-progress-track">' +
            '<div class="ptv-progress-fill ptv-bg-' + r.key + '" style="width:' + barW + '%"></div>' +
          '</div>' +
        '</td>' +
        '<td data-label="Vai trò" style="text-align:center;">' + roleBadge + '</td>' +
      '</tr>';
    }).join('');

    var dungNames = nhStats.dungHy.dung.map(function (h) { return '<strong class="' + h + '">' + HANH_LABEL[h] + '</strong>'; }).join(', ');
    var hyNames = nhStats.dungHy.hy.map(function (h) { return '<strong class="' + h + '">' + HANH_LABEL[h] + '</strong>'; }).join(', ');
    var kyNames = nhStats.dungHy.ky.map(function (h) { return '<strong class="' + h + '">' + HANH_LABEL[h] + '</strong>'; }).join(', ');

    tableSlot.innerHTML =
      '<div class="ptv-nh-summary-bar">' +
        '<div>⚡ <strong>Nhật Chủ:</strong> <span class="' + c.pillars.day.canHanh + '">' + c.pillars.day.canName + ' (' + HANH_LABEL[c.pillars.day.canHanh] + ')</span> — <strong>' + nhStats.dungHy.status + '</strong></div>' +
        '<div>🎯 <strong>Dụng Thần / Hỷ Thần khuyên dùng:</strong> ' + dungNames + ' (Bổ trợ: ' + hyNames + ') &nbsp;|&nbsp; ⚠️ <strong>Hành tiết chế:</strong> ' + kyNames + '</div>' +
      '</div>' +
      '<div class="table-responsive">' +
        '<table class="ptv-nguhanh-table">' +
          '<thead>' +
            '<tr>' +
              '<th>Ngũ Hành</th>' +
              '<th style="text-align:center;">Thập Thần Tương Ứng</th>' +
              '<th style="text-align:center;">Số Lượng (Bản & Tàng)</th>' +
              '<th style="text-align:center;">Tỷ Lệ Nguyên Bản</th>' +
              '<th style="text-align:center;">Tỷ Lệ Tương Phối</th>' +
              '<th>Biểu Đồ Năng Lượng</th>' +
              '<th style="text-align:center;">Vai Trò Dụng Hỷ</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + trsHtml + '</tbody>' +
        '</table>' +
      '</div>';
  }

  function renderDaiVanSection() {
    var c = state.chart;
    var slot = document.getElementById('ptvDaiVanSlot');
    if (!c || !slot) return;

    var cardsHtml = c.daiVanList.map(function (dv, idx) {
      var isActive = (state.selectedDaiVanIdx === idx);
      var tangHtml = dv.tangCan.map(function (tc) {
        return '<div class="ptv-mini-tang-col">' +
          '<div class="' + tc.hanh + '">' + tc.canName + '</div>' +
          '<div class="' + tc.hanh + ' ptv-mini-tt">' + tc.thapThan.short + '</div>' +
        '</div>';
      }).join('');

      return '<div class="ptv-van-card ' + (isActive ? 'active' : '') + '" data-daivan-idx="' + idx + '">' +
        '<div class="ptv-van-head">' +
          '<div class="ptv-van-age">' + dv.meta.ageStart + '</div>' +
          '<div class="ptv-van-year">' + dv.meta.yearStart + '</div>' +
        '</div>' +
        '<div class="ptv-van-body">' +
          '<div class="ptv-van-tt ' + dv.canHanh + '">' + dv.thapThan.short + '</div>' +
          '<div class="ptv-van-can ' + dv.canHanh + '">' + dv.canName + '</div>' +
          '<div class="ptv-van-chi ' + dv.chiHanh + '">' + dv.chiName + '</div>' +
        '</div>' +
        '<div class="ptv-van-tang">' + tangHtml + '</div>' +
      '</div>';
    }).join('');

    slot.innerHTML = '<div class="ptv-van-grid-8">' + cardsHtml + '</div>';
  }

  function renderLuuNienSection() {
    var c = state.chart;
    var slot = document.getElementById('ptvLuuNienSlot');
    if (!c || !slot) return;

    var dvIdx = (state.selectedDaiVanIdx !== null) ? state.selectedDaiVanIdx : 0;
    var dv = c.daiVanList[dvIdx];
    if (!dv) return;

    var cardsHtml = dv.meta.luuNienList.map(function (ln) {
      var isActive = (state.selectedLuuNienYear === ln.meta.year);
      var tangHtml = ln.tangCan.map(function (tc) {
        return '<div class="ptv-mini-tang-col">' +
          '<div class="' + tc.hanh + '">' + tc.canName + '</div>' +
          '<div class="' + tc.hanh + ' ptv-mini-tt">' + tc.thapThan.short + '</div>' +
        '</div>';
      }).join('');

      return '<div class="ptv-van-card ' + (isActive ? 'active' : '') + '" data-luunien-year="' + ln.meta.year + '" data-daivan-idx="' + dvIdx + '">' +
        '<div class="ptv-van-head">' +
          '<div class="ptv-van-age">' + ln.meta.age + '</div>' +
          '<div class="ptv-van-year">' + ln.meta.year + '</div>' +
        '</div>' +
        '<div class="ptv-van-body">' +
          '<div class="ptv-van-tt ' + ln.canHanh + '">' + ln.thapThan.short + '</div>' +
          '<div class="ptv-van-can ' + ln.canHanh + '">' + ln.canName + '</div>' +
          '<div class="ptv-van-chi ' + ln.chiHanh + '">' + ln.chiName + '</div>' +
        '</div>' +
        '<div class="ptv-van-tang">' + tangHtml + '</div>' +
      '</div>';
    }).join('');

    slot.innerHTML = '<div class="ptv-van-grid-10">' + cardsHtml + '</div>';
  }

  function renderLuuNguyetSection() {
    var c = state.chart;
    var slot = document.getElementById('ptvLuuNguyetSlot');
    if (!c || !slot) return;

    var targetYear = state.selectedLuuNienYear || c.viewYear || new Date().getFullYear();
    var months = c.buildLuuNguyetForYear(targetYear);

    var cardsHtml = months.map(function (m) {
      var isActive = (state.selectedLuuNguyetNum === m.meta.monthNum);
      var stemsRow = m.tangCan.map(function (tc) {
        return '<span class="' + tc.hanh + '">' + tc.canName + '</span>';
      }).join('');
      var ttRow = m.tangCan.map(function (tc) {
        return '<span class="' + tc.hanh + '">' + tc.thapThan.short + '</span>';
      }).join('');

      return '<div class="ptv-luunguyet-card ' + (isActive ? 'active' : '') + '" data-luunguyet-num="' + m.meta.monthNum + '">' +
        '<div class="ptv-ln-date">' + m.meta.dateLabel + '</div>' +
        '<div class="ptv-ln-jie">' + m.meta.jieName + '</div>' +
        '<div class="ptv-ln-tt ' + m.canHanh + '">' + m.thapThan.full + '</div>' +
        '<div class="ptv-ln-can ' + m.canHanh + '">' + m.canName + '</div>' +
        '<div class="ptv-ln-chi ' + m.chiHanh + '">' + m.chiName + '</div>' +
        '<div class="ptv-ln-tang-row">' + stemsRow + '</div>' +
        '<div class="ptv-ln-tang-tt-row">' + ttRow + '</div>' +
      '</div>';
    }).join('');

    var yearHeaderEl = document.getElementById('ptvLuuNguyetYearTitle');
    if (yearHeaderEl) {
      yearHeaderEl.textContent = 'Lưu nguyệt năm ' + targetYear + ' (12 tháng Tiết khí)';
    }
    slot.innerHTML = '<div class="ptv-luunguyet-grid-6">' + cardsHtml + '</div>';
  }

  function renderUserInfoHeader() {
    var c = state.chart;
    var slot = document.getElementById('ptvUserInfoSlot');
    if (!c || !slot) return;

    var dateStr = c.solar.timeLabel + ' ' + pad2(c.solar.day) + '/' + pad2(c.solar.month) + '/' + c.solar.year;
    slot.innerHTML =
      '<div class="ptv-info-item"><b>Mệnh chủ:</b> Đương Số (' + c.pillars.year.canName + ' ' + c.pillars.year.chiName + ')</div>' +
      '<div class="ptv-info-item"><b>Ngày sinh:</b> ' + dateStr + ' (Dương lịch)</div>' +
      '<div class="ptv-info-item"><b>Giới tính:</b> ' + c.genderStr + '</div>' +
      '<div class="ptv-info-item"><b>Tiết khí:</b> ' + c.tietKhi.name + ' khởi lúc ' + c.tietKhi.timeStr + '</div>' +
      '<div class="ptv-info-item"><b>Khởi đại vận:</b> ' + c.khoiDaiVanStr + '</div>' +
      '<div class="ptv-info-item"><b>Thai nguyên:</b> <span class="' + c.thaiNguyen.canHanh + '">' + c.thaiNguyen.canName + '</span> <span class="' + c.thaiNguyen.chiHanh + '">' + c.thaiNguyen.chiName + '</span> <span class="' + c.thaiNguyen.napAm.hanh + '">(' + c.thaiNguyen.napAm.name + ')</span></div>' +
      '<div class="ptv-info-item"><b>Mệnh cung:</b> <span class="' + c.menhCung.canHanh + '">' + c.menhCung.canName + '</span> <span class="' + c.menhCung.chiHanh + '">' + c.menhCung.chiName + '</span> <span class="' + c.menhCung.napAm.hanh + '">(' + c.menhCung.napAm.name + ')</span></div>' +
      '<div class="ptv-info-item"><b>Thân cung:</b> <span class="' + c.thanCung.canHanh + '">' + c.thanCung.canName + '</span> <span class="' + c.thanCung.chiHanh + '">' + c.thanCung.chiName + '</span> <span class="' + c.thanCung.napAm.hanh + '">(' + c.thanCung.napAm.name + ')</span></div>' +
      '<div class="ptv-info-item"><b>Không vong:</b> Ngày (' + c.khongVongDay + ') • Năm (' + c.khongVongYear + ')</div>';
  }

  function renderAllBaziUI() {
    renderUserInfoHeader();
    renderMainBaziTable();
    renderDaiVanSection();
    renderLuuNienSection();
    renderLuuNguyetSection();
  }

  function syncBaziFromAppInputs() {
    var dobEl = document.getElementById('dob');
    var gtEl = document.getElementById('gioiTinh');
    var gioEl = document.getElementById('gioSinh');
    var namXetEl = document.getElementById('namXet');
    if (!dobEl || !dobEl.value) return;

    var parts = dobEl.value.split('-');
    var sYear = parseInt(parts[0], 10);
    var sMonth = parseInt(parts[1], 10);
    var sDay = parseInt(parts[2], 10);
    var gioIdx = gioEl ? parseInt(gioEl.value, 10) : 6;
    var gender = gtEl ? gtEl.value : 'nam';
    var viewYear = namXetEl ? parseInt(namXetEl.value, 10) : new Date().getFullYear();

    var chart = calculateBaziChart(sYear, sMonth, sDay, gioIdx, gender, viewYear);
    state.chart = chart;

    // Tự động chọn Đại Vận tương ứng với Năm Xem Hạn (nhưng mặc định mở bảng 4 Trụ như phongthuyvuong.com, đồng thời highlight Đại Vận & Lưu Niên hiện tại ở dưới)
    var currentAge = viewYear - sYear;
    var defaultDvIdx = 0;
    for (var i = 0; i < chart.daiVanList.length; i++) {
      if (currentAge >= chart.daiVanList[i].meta.ageStart) {
        defaultDvIdx = i;
      }
    }
    state.selectedDaiVanIdx = null; // Để bảng trên cùng khởi đầu là 4 trụ nguyên bản (bấm Đại vận sẽ mở 5-7 trụ)
    state.defaultDvIdx = defaultDvIdx;
    state.selectedLuuNienYear = viewYear;
    state.selectedLuuNguyetNum = null;

    renderAllBaziUI();

    // Đánh dấu gợi ý Đại vận của tuổi đang xét
    var dvCards = document.querySelectorAll('#ptvDaiVanSlot .ptv-van-card');
    if (dvCards[defaultDvIdx]) {
      dvCards[defaultDvIdx].classList.add('ptv-current-age-dv');
    }
  }

  function bindBaziEvents() {
    var rootEl = document.getElementById('ptvBaziRoot');
    if (!rootEl || rootEl.dataset.bound === '1') return;
    rootEl.dataset.bound = '1';

    rootEl.addEventListener('click', function (e) {
      // 1. Sub-navigation buttons: Tứ trụ | Đại vận | Lưu niên | Lưu nguyệt | Tương phối
      var navBtn = e.target.closest('[data-ptv-tab]');
      if (navBtn) {
        var key = navBtn.getAttribute('data-ptv-tab');
        if (key === 'tuong-phoi') {
          state.showTuongPhoi = !state.showTuongPhoi;
          navBtn.classList.toggle('active', state.showTuongPhoi);
          renderMainBaziTable();
          return;
        }
        if (key === 'bazi') {
          state.selectedDaiVanIdx = null;
          state.selectedLuuNguyetNum = null;
          state.showTuongPhoi = false;
          var tpBtn = rootEl.querySelector('[data-ptv-tab="tuong-phoi"]');
          if (tpBtn) tpBtn.classList.remove('active');
          renderAllBaziUI();
          return;
        }
        if (key === 'dai-van') {
          var boxDv = document.getElementById('ptv-box-dai-van');
          if (boxDv) boxDv.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (key === 'luu-nien') {
          var boxLn = document.getElementById('ptv-box-luu-nien');
          if (boxLn) boxLn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (key === 'luu-nguyet') {
          var boxLm = document.getElementById('ptv-box-luu-nguyet');
          if (boxLm) boxLm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      // 2. Click vào 1 cột Đại Vận -> Đưa Đại Vận vào bảng chính & mở 10 năm Lưu Niên tương ứng
      var dvCard = e.target.closest('[data-daivan-idx]');
      if (dvCard && !dvCard.hasAttribute('data-luunien-year')) {
        var idx = parseInt(dvCard.getAttribute('data-daivan-idx'), 10);
        state.selectedDaiVanIdx = idx;
        var dv = state.chart.daiVanList[idx];
        state.selectedLuuNienYear = dv ? dv.meta.yearStart : null;
        state.selectedLuuNguyetNum = null;
        renderAllBaziUI();
        return;
      }

      // 3. Click vào 1 cột Lưu Niên -> Đưa cả Đại Vận + Lưu Niên vào bảng chính & cập nhật 12 Lưu Nguyệt
      var lnCard = e.target.closest('[data-luunien-year]');
      if (lnCard) {
        var yr = parseInt(lnCard.getAttribute('data-luunien-year'), 10);
        var dvIdx = parseInt(lnCard.getAttribute('data-daivan-idx'), 10);
        if (state.selectedDaiVanIdx === null) {
          state.selectedDaiVanIdx = isNaN(dvIdx) ? (state.defaultDvIdx || 0) : dvIdx;
        }
        state.selectedLuuNienYear = yr;
        state.selectedLuuNguyetNum = null;
        renderAllBaziUI();
        return;
      }

      // 4. Click vào 1 ô Lưu Nguyệt -> Đưa thêm cột Lưu Nguyệt vào bảng chính
      var lmCard = e.target.closest('[data-luunguyet-num]');
      if (lmCard) {
        var mNum = parseInt(lmCard.getAttribute('data-luunguyet-num'), 10);
        if (state.selectedDaiVanIdx === null) {
          state.selectedDaiVanIdx = state.defaultDvIdx || 0;
        }
        if (state.selectedLuuNienYear === null) {
          state.selectedLuuNienYear = state.chart.viewYear || new Date().getFullYear();
        }
        state.selectedLuuNguyetNum = (state.selectedLuuNguyetNum === mNum) ? null : mNum;
        renderAllBaziUI();
        return;
      }

      // 5. Click vào 1 sao Thần Sát -> Hiện hộp thoại giải nghĩa chi tiết
      var ssPill = e.target.closest('[data-shensha]');
      if (ssPill) {
        var code = ssPill.getAttribute('data-shensha');
        var info = SHEN_SHA_DESCRIPTIONS[code] || {
          title: ssPill.textContent,
          desc: 'Thần sát trong hệ thống Bát Tự Tứ Trụ dùng để luận đoán thêm về cát hung, tính cách và vận hạn của mệnh chủ.'
        };
        var modal = document.getElementById('ptvShenShaModal');
        var modalTitle = document.getElementById('ptvShenShaModalTitle');
        var modalDesc = document.getElementById('ptvShenShaModalDesc');
        if (modal && modalTitle && modalDesc) {
          modalTitle.textContent = '✨ ' + info.title;
          modalDesc.textContent = info.desc;
          modal.style.display = 'block';
        }
        return;
      }

      if (e.target.closest('#ptvCloseShenShaModal')) {
        var mEl = document.getElementById('ptvShenShaModal');
        if (mEl) mEl.style.display = 'none';
      }
    });
  }

  root.BatTuTuTru = {
    calculateBaziChart: calculateBaziChart,
    syncBaziFromAppInputs: function () {
      bindBaziEvents();
      syncBaziFromAppInputs();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
