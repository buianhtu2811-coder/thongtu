/**
 * logic_thongthu.js - Mở rộng tính toán Sách Thông Thư, Độ Hợp Ngày với Đương Số, Bát Tự & Trùng Tang
 */
(function (root) {
  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var CON_GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];
  var HANH_CAN = ['Mộc', 'Mộc', 'Hỏa', 'Hỏa', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Thủy', 'Thủy'];
  var HANH_CHI = ['Thủy', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hỏa', 'Hỏa', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thủy'];
  var AM_DUONG_CAN = ['+', '-', '+', '-', '+', '-', '+', '-', '+', '-'];
  var AM_DUONG_CHI = ['+', '-', '+', '-', '+', '-', '+', '-', '+', '-', '+', '-'];

  var NAP_AM_60 = [
    'Hải Trung Kim', 'Hải Trung Kim', 'Lư Trung Hỏa', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Đại Lâm Mộc',
    'Lộ Bàng Thổ', 'Lộ Bàng Thổ', 'Kiếm Phong Kim', 'Kiếm Phong Kim', 'Sơn Đầu Hỏa', 'Sơn Đầu Hỏa',
    'Giản Hạ Thủy', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Bạch Lạp Kim',
    'Dương Liễu Mộc', 'Dương Liễu Mộc', 'Tuyền Trung Thủy', 'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Ốc Thượng Thổ',
    'Tích Lịch Hỏa', 'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Tùng Bách Mộc', 'Trường Lưu Thủy', 'Trường Lưu Thủy',
    'Sa Trung Kim', 'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bình Địa Mộc',
    'Bích Thượng Thổ', 'Bích Thượng Thổ', 'Kim Bạch Kim', 'Kim Bạch Kim', 'Phú Đăng Hỏa', 'Phú Đăng Hỏa',
    'Thiên Hà Thủy', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Đại Trạch Thổ', 'Thoa Xuyến Kim', 'Thoa Xuyến Kim',
    'Tang Đố Mộc', 'Tang Đố Mộc', 'Đại Khê Thủy', 'Đại Khê Thủy', 'Sa Trung Thổ', 'Sa Trung Thổ',
    'Thiên Thượng Hỏa', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Thạch Lựu Mộc', 'Đại Hải Thủy', 'Đại Hải Thủy'
  ];

  var NGU_HANH_NAP_AM = [
    'Kim', 'Kim', 'Hỏa', 'Hỏa', 'Mộc', 'Mộc', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Hỏa', 'Hỏa',
    'Thủy', 'Thủy', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Mộc', 'Mộc', 'Thủy', 'Thủy', 'Thổ', 'Thổ',
    'Hỏa', 'Hỏa', 'Mộc', 'Mộc', 'Thủy', 'Thủy', 'Kim', 'Kim', 'Hỏa', 'Hỏa', 'Mộc', 'Mộc',
    'Thổ', 'Thổ', 'Kim', 'Kim', 'Hỏa', 'Hỏa', 'Thủy', 'Thủy', 'Thổ', 'Thổ', 'Kim', 'Kim',
    'Mộc', 'Mộc', 'Thủy', 'Thủy', 'Thổ', 'Thổ', 'Hỏa', 'Hỏa', 'Mộc', 'Mộc', 'Thủy', 'Thủy'
  ];

  var SINH = { 'Kim': 'Thủy', 'Thủy': 'Mộc', 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim' };
  var KHAC = { 'Kim': 'Mộc', 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim' };

  function mod(a, n) { return ((a % n) + n) % n; }

  function getHoaGiapIndex(canIdx, chiIdx) {
    for (var i = 0; i < 60; i++) {
      if (i % 10 === canIdx && i % 12 === chiIdx) return i;
    }
    return 0;
  }

  function getNapAm(canIdx, chiIdx) {
    var idx = getHoaGiapIndex(canIdx, chiIdx);
    return {
      ten: NAP_AM_60[idx],
      hanh: NGU_HANH_NAP_AM[idx]
    };
  }

  function quanHeMenh(h1, h2) {
    if (!h1 || !h2) return 'Bình hòa';
    h1 = h1.trim(); h2 = h2.trim();
    if (h1 === h2) return 'Tương hòa (cùng hành ' + h1 + ')';
    if (SINH[h1] === h2) return h1 + ' sinh ' + h2 + ' (Tương sinh - Rất tốt)';
    if (SINH[h2] === h1) return h2 + ' sinh ' + h1 + ' (Tương sinh - Rất tốt)';
    if (KHAC[h1] === h2) return h1 + ' khắc ' + h2 + ' (Tương khắc - Cần lưu ý)';
    return h2 + ' khắc ' + h1 + ' (Tương khắc - Cần lưu ý)';
  }

  // ĐÁNH GIÁ NGÀY VỚI ĐƯƠNG SỐ (CHUẨN PHONG THỦY THIÊN MINH & THÔNG THƯ NGỌC HẠP)
  function danhGiaNgayVoiDuongSo(ngayCanChi, ngayNapAm, duongSo, mucDich) {
    // duongSo: { can: canIdx, chi: chiIdx, hanh: 'Mộc' }
    var diem = 50;
    var chiTiet = [];
    var mucDichVal = mucDich || 'all';

    // 1. Ngũ Hành Nạp Âm
    var hanhNgay = ngayNapAm.hanh;
    var hanhMenh = duongSo.hanh;
    if (SINH[hanhNgay] === hanhMenh) {
      diem += 25;
      chiTiet.push({ loai: 'tot', tieuDe: 'Ngũ hành tương sinh (Đại Cát)', moTa: 'Ngày ' + hanhNgay + ' sinh Mệnh ' + hanhMenh + ' của đương số. Tăng cường vượng khí bản mệnh, làm việc gì cũng dễ gặp quý nhân tương trợ, công việc thuận buồm xuôi gió.' });
    } else if (hanhNgay === hanhMenh) {
      diem += 15;
      chiTiet.push({ loai: 'tot', tieuDe: 'Ngũ hành tương hòa (Tốt)', moTa: 'Ngày ' + hanhNgay + ' đồng hành với Mệnh ' + hanhMenh + ' của đương số. Khí trường bình ổn vững vàng, thích hợp cho việc duy trì và phát triển sự nghiệp.' });
    } else if (SINH[hanhMenh] === hanhNgay) {
      diem -= 5;
      chiTiet.push({ loai: 'trung', tieuDe: 'Bản mệnh sinh xuất (Hao tiết)', moTa: 'Mệnh ' + hanhMenh + ' sinh Ngày ' + hanhNgay + '. Bản mệnh bị hao tổn sinh khí cho ngày, cần chú ý giữ gìn sức khỏe, tránh làm việc quá sức.' });
    } else if (KHAC[hanhMenh] === hanhNgay) {
      diem += 5;
      chiTiet.push({ loai: 'trung', tieuDe: 'Bản mệnh khắc chế ngày', moTa: 'Mệnh đương số khắc được hành của ngày, làm chủ được hoàn cảnh nhưng đòi hỏi phải nỗ lực và hao tổn nhiều công sức.' });
    } else {
      diem -= 25;
      chiTiet.push({ loai: 'xau', tieuDe: 'Ngày khắc Mệnh đương số (Đại Kỵ)', moTa: 'Ngày ' + hanhNgay + ' khắc phạt Mệnh ' + hanhMenh + ' của đương số. Khí trường tương sát gây tổn hại nguyên khí, dễ gặp trắc trở, kiện tụng hoặc tổn thất tiền của.' });
    }

    // 2. Địa Chi: Tam Hợp, Lục Hợp, Lục Xung, Tương Hại, Tương Hình
    var cNgay = ngayCanChi.chi;
    var cTuoi = duongSo.chi;

    // Tam hợp
    var TAM_HOP = [[8, 0, 4], [5, 9, 1], [2, 6, 10], [11, 3, 7]];
    var isTamHop = false;
    for (var i = 0; i < TAM_HOP.length; i++) {
      if (TAM_HOP[i].indexOf(cNgay) >= 0 && TAM_HOP[i].indexOf(cTuoi) >= 0 && cNgay !== cTuoi) {
        isTamHop = true; break;
      }
    }
    if (isTamHop) {
      diem += 20;
      chiTiet.push({ loai: 'tot', tieuDe: 'Địa chi Tam Hợp (Thượng Cát)', moTa: 'Chi ngày ' + CHI[cNgay] + ' cùng chi tuổi ' + CHI[cTuoi] + ' nằm trong vòng Tam Hợp. Năng lượng dung hòa, mưu sự đại đăng khoa, nhân duyên và sự nghiệp đều đắc lợi.' });
    }

    // Lục hợp
    var LUC_HOP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
    if (LUC_HOP[cNgay] === cTuoi) {
      diem += 20;
      chiTiet.push({ loai: 'tot', tieuDe: 'Địa chi Lục Hợp (Đại Cát)', moTa: 'Chi ngày ' + CHI[cNgay] + ' Lục Hợp với tuổi ' + CHI[cTuoi] + '. Thiên thời địa lợi nhân hòa, gia đạo êm ấm, đối tác đồng lòng, ký kết thuận lợi.' });
    }

    // Lục xung (Chính xung tuổi)
    var LUC_XUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3, 4: 10, 10: 4, 5: 11, 11: 5 };
    var isLucXung = (LUC_XUNG[cNgay] === cTuoi);
    if (isLucXung) {
      diem -= 30;
      chiTiet.push({ loai: 'xau', tieuDe: 'Địa chi Lục Xung (Đại Kỵ Chính Xung Tuổi)', moTa: 'Ngày ' + CHI[cNgay] + ' chính xung trực diện với tuổi ' + CHI[cTuoi] + ' của đương số. Tuyệt đối kiêng khởi sự đại sự: động thổ, cưới hỏi, xuất hành xa, ký hợp đồng kinh tế lớn.' });
    }

    // Lục hại
    var LUC_HAI = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 5, 5: 2, 3: 4, 4: 3, 8: 11, 11: 8, 9: 10, 10: 9 };
    if (LUC_HAI[cNgay] === cTuoi) {
      diem -= 15;
      chiTiet.push({ loai: 'xau', tieuDe: 'Địa chi Tương Hại', moTa: 'Ngày ' + CHI[cNgay] + ' tương hại với tuổi ' + CHI[cTuoi] + '. Đề phòng tiểu nhân ghen ghét, hãm hại sau lưng, phát sinh bất hòa và tranh cãi nội bộ.' });
    }

    // Tương hình
    var isTuongHinh = false;
    var moTaHinh = '';
    if ((cTuoi === 2 && cNgay === 5) || (cTuoi === 5 && cNgay === 8) || (cTuoi === 8 && cNgay === 2)) {
      isTuongHinh = true; moTaHinh = 'Tam hình Dần - Tị - Thân (Vô ân chi hình)';
    } else if ((cTuoi === 1 && cNgay === 10) || (cTuoi === 10 && cNgay === 7) || (cTuoi === 7 && cNgay === 1)) {
      isTuongHinh = true; moTaHinh = 'Tam hình Sửu - Tuất - Mùi (Trì thế chi hình)';
    } else if ((cTuoi === 0 && cNgay === 3) || (cTuoi === 3 && cNgay === 0)) {
      isTuongHinh = true; moTaHinh = 'Tương hình Tý - Mão (Vô lễ chi hình)';
    } else if (cTuoi === cNgay && (cTuoi === 4 || cTuoi === 6 || cTuoi === 9 || cTuoi === 11)) {
      isTuongHinh = true; moTaHinh = 'Tự hình (Thìn, Ngọ, Dậu, Hợi tự hình)';
    }
    if (isTuongHinh) {
      diem -= 12;
      chiTiet.push({ loai: 'xau', tieuDe: 'Địa chi Tương Hình', moTa: moTaHinh + ': Cần thận trọng lời ăn tiếng nói, tránh va chạm pháp lý, giấy tờ cần kiểm tra kỹ.' });
    }

    // 3. Thiên Can: Tương Hợp, Tương Khắc & Thiên Khắc Địa Xung
    var CAN_HOP = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };
    var kNgay = ngayCanChi.can;
    var kTuoi = duongSo.can;
    if (CAN_HOP[kNgay] === kTuoi) {
      diem += 15;
      chiTiet.push({ loai: 'tot', tieuDe: 'Thiên Can Tương Hợp (Quý Cách)', moTa: 'Can ngày ' + CAN[kNgay] + ' hòa hợp với Can tuổi ' + CAN[kTuoi] + ' (Âm Dương tương phối, Thiên Ất quý nhân hội tụ, hanh thông tài lộc).' });
    }

    var CAN_KHAC = { 0: 6, 1: 7, 2: 8, 3: 9, 4: 0, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5 };
    var isCanKhac = (CAN_KHAC[kNgay] === kTuoi);
    if (isCanKhac) {
      diem -= 12;
      chiTiet.push({ loai: 'xau', tieuDe: 'Thiên Can Tương Khắc', moTa: 'Can ngày ' + CAN[kNgay] + ' khắc phạt Can tuổi ' + CAN[kTuoi] + '. Trực tiếp tạo áp lực công việc, nên tiến hành thận trọng, bình tĩnh.' });
    }

    // THIÊN KHẮC ĐỊA XUNG (Đại Hung Cực Điểm)
    if (isCanKhac && isLucXung) {
      diem -= 20; // Trừ thêm 20đ (tổng trừ trên 60đ)
      chiTiet.unshift({ loai: 'xau', tieuDe: '⚡ THIÊN KHẮC ĐỊA XUNG (Cực Hung)', moTa: 'Ngày này vừa khắc Thiên Can vừa xung Địa Chi với tuổi đương số. Đây là ngày sát phạt bản mệnh nặng nề nhất, tuyệt đối không được tiến hành bất kỳ việc đại sự nào!' });
    }

    diem = Math.max(5, Math.min(100, Math.round(diem)));
    var xepLoai = '';
    if (diem >= 85) xepLoai = 'Đại Cát • Thượng Kiết (Rất hợp với đương số)';
    else if (diem >= 70) xepLoai = 'Cát • Ngày Tốt (Thuận lợi khởi sự)';
    else if (diem >= 50) xepLoai = 'Bình Hòa (Bình thường, làm việc thường nhật)';
    else xepLoai = 'Hung • Đại Kỵ Xung Tuổi (Nên tránh khởi sự)';

    return {
      diem: diem,
      xepLoai: xepLoai,
      chiTiet: chiTiet,
      isLucXung: isLucXung,
      isTamHop: isTamHop,
      isLucHop: (LUC_HOP[cNgay] === cTuoi),
      isCanKhac: isCanKhac,
      isThienKhacDiaXung: (isCanKhac && isLucXung),
      isNgayKhacMenh: (SINH[hanhNgay] !== hanhMenh && hanhNgay !== hanhMenh && SINH[hanhMenh] !== hanhNgay && KHAC[hanhMenh] !== hanhNgay)
    };
  }

  // TÍNH TOÁN BÁT TỰ TỨ TRỤ
  function tinhBatTuTuTru(dob, gioIndex) {
    var jdn = Lunar.jdFromDate(dob.d, dob.m, dob.y);
    var lunar = Lunar.solar2Lunar(dob.d, dob.m, dob.y);

    var canNam = mod(lunar.year + 6, 10);
    var chiNam = mod(lunar.year + 8, 12);

    var canThang1 = (canNam * 2 + 1) % 10;
    var canThang = (canThang1 + lunar.month - 1) % 10;
    var chiThang = mod(lunar.month + 1, 12);

    var canNgay = mod(jdn + 9, 10);
    var chiNgay = mod(jdn + 1, 12);

    var canGioTy = (canNgay * 2) % 10;
    var canGio = (canGioTy + gioIndex) % 10;
    var chiGio = gioIndex;

    function getThapThan(canTru) {
      var sameAD = (AM_DUONG_CAN[canTru] === AM_DUONG_CAN[canNgay]);
      var hanhTru = HANH_CAN[canTru];
      var hanhNC = HANH_CAN[canNgay];

      if (canTru === canNgay) return 'Nhật Chủ';
      if (hanhTru === hanhNC) return sameAD ? 'Tỷ Kiên' : 'Kiếp Tài';
      if (SINH[hanhNC] === hanhTru) return sameAD ? 'Thực Thần' : 'Thương Quan';
      if (KHAC[hanhNC] === hanhTru) return sameAD ? 'Thiên Tài' : 'Chính Tài';
      if (KHAC[hanhTru] === hanhNC) return sameAD ? 'Thất Sát' : 'Chính Quan';
      if (SINH[hanhTru] === hanhNC) return sameAD ? 'Thiên Ấn' : 'Chính Ấn';
      return '';
    }

    var TRUONG_SINH_START = {
      0: 11, 1: 6, 2: 2, 3: 9, 4: 2, 5: 9, 6: 5, 7: 0, 8: 8, 9: 3
    };
    var VONG_TS_NAMES = ['Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];

    function getTruongSinh(chiTru) {
      var start = TRUONG_SINH_START[canNgay];
      var isDuong = (AM_DUONG_CAN[canNgay] === '+');
      var offset = isDuong ? mod(chiTru - start, 12) : mod(start - chiTru, 12);
      return VONG_TS_NAMES[offset];
    }

    function getThanSat(chiTru, canTru) {
      var list = [];
      var LOC = { 0: 2, 1: 3, 2: 5, 3: 6, 4: 5, 5: 6, 6: 8, 7: 9, 8: 11, 9: 0 };
      if (LOC[canNgay] === chiTru) list.push('Lộc Thần');

      var QUY_NHAN = {
        0: [1, 7], 4: [1, 7], 6: [1, 7],
        1: [0, 8], 5: [0, 8],
        2: [11, 9], 3: [11, 9],
        7: [2, 6],
        8: [5, 3], 9: [5, 3]
      };
      if (QUY_NHAN[canNgay] && QUY_NHAN[canNgay].indexOf(chiTru) >= 0) list.push('Thiên Ất Quý Nhân');

      var HOA_CAI = { 8: 4, 0: 4, 4: 4, 5: 1, 9: 1, 1: 1, 2: 10, 6: 10, 10: 10, 11: 7, 3: 7, 7: 7 };
      if (HOA_CAI[chiNam] === chiTru) list.push('Hoa Cái');

      var DICH_MA = { 8: 2, 0: 2, 4: 2, 5: 11, 9: 11, 1: 11, 2: 8, 6: 8, 10: 8, 11: 5, 3: 5, 7: 5 };
      if (DICH_MA[chiNam] === chiTru) list.push('Dịch Mã');

      var DAO_HOA = { 8: 9, 0: 9, 4: 9, 5: 6, 9: 6, 1: 6, 2: 3, 6: 3, 10: 3, 11: 0, 3: 0, 7: 0 };
      if (DAO_HOA[chiNam] === chiTru) list.push('Đào Hoa');

      return list;
    }

    var truNam = {
      ten: 'Trụ Năm', can: CAN[canNam], chi: CHI[chiNam], canChi: CAN[canNam] + ' ' + CHI[chiNam],
      amDuong: AM_DUONG_CAN[canNam] + AM_DUONG_CHI[chiNam], napAm: getNapAm(canNam, chiNam).ten,
      thapThan: getThapThan(canNam), truongSinh: getTruongSinh(chiNam), thanSat: getThanSat(chiNam, canNam)
    };
    var truThang = {
      ten: 'Trụ Tháng', can: CAN[canThang], chi: CHI[chiThang], canChi: CAN[canThang] + ' ' + CHI[chiThang],
      amDuong: AM_DUONG_CAN[canThang] + AM_DUONG_CHI[chiThang], napAm: getNapAm(canThang, chiThang).ten,
      thapThan: getThapThan(canThang), truongSinh: getTruongSinh(chiThang), thanSat: getThanSat(chiThang, canThang)
    };
    var truNgay = {
      ten: 'Trụ Ngày', can: CAN[canNgay], chi: CHI[chiNgay], canChi: CAN[canNgay] + ' ' + CHI[chiNgay],
      amDuong: AM_DUONG_CAN[canNgay] + AM_DUONG_CHI[chiNgay], napAm: getNapAm(canNgay, chiNgay).ten,
      thapThan: 'Nhật Chủ', truongSinh: getTruongSinh(chiNgay), thanSat: getThanSat(chiNgay, canNgay)
    };
    var truGio = {
      ten: 'Trụ Giờ', can: CAN[canGio], chi: CHI[chiGio], canChi: CAN[canGio] + ' ' + CHI[chiGio],
      amDuong: AM_DUONG_CAN[canGio] + AM_DUONG_CHI[chiGio], napAm: getNapAm(canGio, chiGio).ten,
      thapThan: getThapThan(canGio), truongSinh: getTruongSinh(chiGio), thanSat: getThanSat(chiGio, canGio)
    };

    var daiVan = [];
    var isNamDuong = (AM_DUONG_CAN[canNam] === '+');
    for (var dv = 1; dv <= 8; dv++) {
      var dvCan = isNamDuong ? mod(canThang + dv, 10) : mod(canThang - dv, 10);
      var dvChi = isNamDuong ? mod(chiThang + dv, 12) : mod(chiThang - dv, 12);
      var moxTuoi = 7 + (dv - 1) * 10;
      var moxNam = lunar.year + moxTuoi - 1;
      daiVan.push({
        tuoi: moxTuoi,
        nam: moxNam,
        canChi: CAN[dvCan] + ' ' + CHI[dvChi],
        napAm: getNapAm(dvCan, dvChi).ten
      });
    }

    return {
      truNam: truNam,
      truThang: truThang,
      truNgay: truNgay,
      truGio: truGio,
      daiVan: daiVan
    };
  }

  // TÍNH TRÙNG TANG (Chuẩn phương pháp Bát Trạch tang tế & Sim Kinh Dịch)
  function tinhTrungTang(namSinh, namChet, thangChetAm, ngayChetAm, gioChetChi, gioiTinh, hoTen) {
    var tuoiMu = namChet - namSinh + 1;
    var isNam = (gioiTinh === 'nam');

    // 12 Địa chi phân thành 3 nhóm:
    // Tứ Sinh (Dần, Thân, Tỵ, Hợi): Trùng Tang (Hung)
    // Tứ Vượng (Tý, Ngọ, Mão, Dậu): Thiên Di (Bình)
    // Tứ Mộ (Thìn, Tuất, Sửu, Mùi): Nhập Mộ (Cát)
    var CUNG_TANG = {
      0: 'Thiên Di', 1: 'Nhập Mộ', 2: 'Trùng Tang', 3: 'Thiên Di',
      4: 'Nhập Mộ', 5: 'Trùng Tang', 6: 'Thiên Di', 7: 'Nhập Mộ',
      8: 'Trùng Tang', 9: 'Thiên Di', 10: 'Nhập Mộ', 11: 'Trùng Tang'
    };

    var tens = Math.floor(tuoiMu / 10);
    var ones = tuoiMu % 10;

    // 1. Cung Tuổi (Cung Năm)
    var cungNam;
    if (isNam) {
      // Nam khởi từ Dần (2), tính thuận chiều kim đồng hồ
      var posTensNam = (tens >= 1) ? mod(2 + (tens - 1), 12) : 2;
      cungNam = (tens >= 1) ? mod(posTensNam + ones, 12) : mod(2 + (tuoiMu - 1), 12);
    } else {
      // Nữ khởi từ Thân (8), tính nghịch chiều kim đồng hồ
      var posTensNu = (tens >= 1) ? mod(8 - (tens - 1), 12) : 8;
      cungNam = (tens >= 1) ? mod(posTensNu - ones, 12) : mod(8 - (tuoiMu - 1), 12);
    }

    // 2. Cung Tháng mất:
    // Từ cung Tuổi, cung kế tiếp (Nam thuận / Nữ nghịch) là Tháng 1
    var cungThang = isNam ? mod(cungNam + thangChetAm, 12) : mod(cungNam - thangChetAm, 12);

    // 3. Cung Ngày mất:
    // Từ cung Tháng, cung kế tiếp (Nam thuận / Nữ nghịch) là Ngày 1
    var cungNgay = isNam ? mod(cungThang + ngayChetAm, 12) : mod(cungThang - ngayChetAm, 12);

    // 4. Cung Giờ mất:
    // Từ cung Ngày, cung kế tiếp (Nam thuận / Nữ nghịch) là Giờ Tý (chi 0)
    var cungGio = isNam ? mod(cungNgay + 1 + gioChetChi, 12) : mod(cungNgay - 1 - gioChetChi, 12);

    var resNam = CUNG_TANG[cungNam];
    var resThang = CUNG_TANG[cungThang];
    var resNgay = CUNG_TANG[cungNgay];
    var resGio = CUNG_TANG[cungGio];

    var countMo = 0, countDi = 0, countTrung = 0;
    var listCungMo = [];
    var listCungDi = [];
    var listCungTrung = [];

    var danhSachCung = [
      { ten: 'Năm', chi: CHI[cungNam], loai: resNam, yNghia: 'Cung Tuổi người mất' },
      { ten: 'Tháng', chi: CHI[cungThang], loai: resThang, yNghia: 'Cung Tháng mất' },
      { ten: 'Ngày', chi: CHI[cungNgay], loai: resNgay, yNghia: 'Cung Ngày mất' },
      { ten: 'Giờ', chi: CHI[cungGio], loai: resGio, yNghia: 'Cung Giờ mất' }
    ];

    danhSachCung.forEach(function (c) {
      if (c.loai === 'Nhập Mộ') { countMo++; listCungMo.push(c.ten + ' cung ' + c.chi); }
      else if (c.loai === 'Thiên Di') { countDi++; listCungDi.push(c.ten + ' cung ' + c.chi); }
      else if (c.loai === 'Trùng Tang') { countTrung++; listCungTrung.push(c.ten + ' cung ' + c.chi); }
    });

    // Phân tích cấp độ trùng tang theo Sim Kinh Dịch
    var chiTietTrung = [];
    if (resNgay === 'Trùng Tang') chiTietTrung.push('Trùng Ngày • Tam Xa: Mức độ nặng nhất theo cổ truyền, cần đặc biệt lưu ý');
    if (resThang === 'Trùng Tang') chiTietTrung.push('Trùng Tháng • Nhị Xa: Mức độ nặng nhì');
    if (resGio === 'Trùng Tang') chiTietTrung.push('Trùng Giờ • Nhất Xa: Mức độ nặng vừa');
    if (resNam === 'Trùng Tang') chiTietTrung.push('Trùng Năm: Mức độ nhẹ nhất, qua ba năm mãn hạn');

    // Kết luận tổng quan
    var ketLuan = '';
    var chiTietGiaiThich = '';
    var statusClass = 'good';

    if (countMo > 0) {
      ketLuan = 'Được Nhập Mộ • ' + countMo + ' Cung Nhập Mộ • Cát Lành, Yên Ổn';
      statusClass = 'good';
      chiTietGiaiThich = 'Dân gian có câu: "Nhất Mộ sát tam trùng" – chỉ cần có một cung Nhập Mộ (' + listCungMo.join(', ') + ') thì đã đủ sức hóa giải các cung Trùng Tang. Người mất ra đi được yên nghỉ cõi vĩnh hằng, cửa âm đã khép, vong linh siêu thoát và không còn vướng bận trần gian. Gia quyến hoàn toàn an tâm, không phải lo lắng hay lập đàn cắt trùng, chỉ cần chuyên tâm tụng kinh sám hối, làm việc thiện hồi hướng công đức.';
    } else if (countTrung === 0) {
      ketLuan = 'Thuận Thiên Di • Toàn Cung Thiên Di • Bình Hòa Theo Lẽ Trời';
      statusClass = 'gold';
      chiTietGiaiThich = 'Cả bốn cung đều rơi vào Thiên Di (' + listCungDi.join(', ') + '). Người mất ra đi do thiên mệnh an bài, thuận theo lẽ trời tự nhiên, không phạm vào sát khí trùng tang. Gia đạo bình an, tang lễ tiến hành chu toàn theo phong tục truyền thống.';
    } else {
      ketLuan = 'Phạm Trùng Tang • ' + countTrung + ' Cung Trùng • Cần Kiêng Cữ & Hóa Giải';
      statusClass = 'bad';
      chiTietGiaiThich = 'Thời điểm mất không có cung Nhập Mộ nào hóa giải và phạm vào ' + countTrung + ' cung Trùng Tang: ' + listCungTrung.join(', ') + '. ' +
        (chiTietTrung.length > 0 ? ('Trong đó: ' + chiTietTrung.join('; ') + '. ') : '') +
        'Theo quan niệm tâm linh Á Đông, đây là trạng thái âm khí chưa dứt khoát. Gia đình nên nhờ các bậc chư tăng cao đức lập đàn tụng kinh Địa Tạng, gửi vong linh lên chùa có giới luật nghiêm minh (như Chùa Hàm Long - Bắc Ninh), phóng sinh tu phúc và kiêng gọi tên vong hồn về nhà khi chưa mãn tang.';
    }

    // 5. Kiểm tra Thần Trùng (Thần Trùng Tướng Quân)
    var THAN_TRUNG_THANG = {
      1: 0, 7: 0,   // Tháng 1, 7 ngày Tý
      2: 2, 8: 2,   // Tháng 2, 8 ngày Dần
      3: 4, 9: 4,   // Tháng 3, 9 ngày Thìn
      4: 6, 10: 6,  // Tháng 4, 10 ngày Ngọ
      5: 8, 11: 8,  // Tháng 5, 11 ngày Thân
      6: 10, 12: 10 // Tháng 6, 12 ngày Tuất
    };
    var chiThanTrung = THAN_TRUNG_THANG[thangChetAm];
    var phamThanTrung = (cungNgay === chiThanTrung);

    // 6. BÀI THƠ TANG SỰ CA QUYẾT TỪ FILE EXCEL (GIỮ NGUYÊN BẢN GỐC SHEET TEST)
    var chiNamChet = mod(namChet + 8, 12);
    var poemTangMap = {
      1: { ten: 'Thần Giác', tho: ['Thần Giác ba năm sự chẳng thường,', 'Ba năm con cháu khổ tai ương,', 'Gia tài đất cát chưa yên mãi,', 'Anh em thân tộc cũng chẳng nhường.'] },
      2: { ten: 'Tế Nhĩ', tho: ['Tế Nhĩ nhất định chủ hồi hương,', 'Cháu con hòa thuận vẫn yên thường,', 'Làm ăn tiền phát gia quyền tước,', 'Tài lộc công danh có như thường.'] },
      3: { ten: 'Mục Yêu', tho: ['Mục Yêu gia phả thấy rõ ràng,', 'Cháu con dâm loạn khiến gian tham,', 'Bài bạc tiền hao đều chẳng tốt,', 'Phá tán sự nghiệp phải nghèo nàn.'] },
      4: { ten: 'Vi Túc', tho: ['Vi Túc ca dao cổ lại phương,', 'Chết gặp hai chữ bị tổn thương,', 'Cháu con ly tán thêm nghèo khổ,', 'Lụy ứa gian nan chịu lệ vương.'] },
      5: { ten: 'Tản Tử', tho: ['Tản Tử tổ phụ hồn quy hương,', 'Anh đệ tiếng vang rộng bốn phương,', 'Chết gặp hai chữ thật là tốt,', 'Ngày sau con cháu được phú cường.'] },
      6: { ten: 'Phúc Tưởng', tho: ['Phúc Tưởng nhất kiến ngộ quân vương,', 'Chớ có bi ai chớ lo lường,', 'Phú quý công danh sẵn cũng có,', 'Con cháu sang trọng hưởng vinh sương.'] }
    };

    var poemIdx = mod(chiNamChet + cungNgay, 6) + 1;
    var poem = poemTangMap[poemIdx] || poemTangMap[2];

    return {
      hoTen: hoTen || '',
      gioiTinh: gioiTinh,
      tuoiMu: tuoiMu,
      canChiNamSinh: PT.CAN[mod(namSinh + 6, 10)] + ' ' + PT.CHI[mod(namSinh + 8, 12)],
      canChiNamChet: PT.CAN[mod(namChet + 6, 10)] + ' ' + PT.CHI[chiNamChet],
      cungNam: { chi: CHI[cungNam], ketQua: resNam, danhGia: resNam === 'Nhập Mộ' ? 'Tốt' : (resNam === 'Thiên Di' ? 'Bình' : 'Xấu') },
      cungThang: { chi: CHI[cungThang], ketQua: resThang, danhGia: resThang === 'Nhập Mộ' ? 'Tốt' : (resThang === 'Thiên Di' ? 'Bình' : 'Xấu') },
      cungNgay: { chi: CHI[cungNgay], ketQua: resNgay, danhGia: resNgay === 'Nhập Mộ' ? 'Tốt' : (resNgay === 'Thiên Di' ? 'Bình' : 'Xấu') },
      cungGio: { chi: CHI[cungGio], ketQua: resGio, danhGia: resGio === 'Nhập Mộ' ? 'Tốt' : (resGio === 'Thiên Di' ? 'Bình' : 'Xấu') },
      countMo: countMo,
      countDi: countDi,
      countTrung: countTrung,
      ketLuan: ketLuan,
      statusClass: statusClass,
      chiTiet: chiTietGiaiThich,
      chiTietTrung: chiTietTrung,
      phamThanTrung: phamThanTrung,
      thanTrungChi: CHI[chiThanTrung],
      poem: poem
    };
  }

  // TÍNH TOÁN KẾ HOẠCH SINH CON HỢP BỐ MẸ (10 NĂM TỚI)
  function tinhKeHoachSinhCon(namBo, namMe) {
    var canBo = mod(namBo + 6, 10);
    var chiBo = mod(namBo + 8, 12);
    var napAmBo = getNapAm(canBo, chiBo);

    var canMe = mod(namMe + 6, 10);
    var chiMe = mod(namMe + 8, 12);
    var napAmMe = getNapAm(canMe, chiMe);

    var currentYear = new Date().getFullYear();
    var danhSachNam = [];

    var TAM_HOP = [[8, 0, 4], [5, 9, 1], [2, 6, 10], [11, 3, 7]];
    var LUC_HOP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
    var LUC_XUNG = { 0: 6, 6: 0, 1: 7, 7: 1, 2: 8, 8: 2, 3: 9, 9: 3, 4: 10, 10: 4, 5: 11, 11: 5 };

    for (var y = currentYear; y <= currentYear + 11; y++) {
      var cCon = mod(y + 6, 10);
      var zCon = mod(y + 8, 12);
      var naCon = getNapAm(cCon, zCon);

      var diem = 10;
      var ghiChu = [];

      if (SINH[naCon.hanh] === napAmBo.hanh) {
        diem += 3; ghiChu.push('Con sinh Mệnh Bố (+3đ)');
      } else if (SINH[napAmBo.hanh] === naCon.hanh) {
        diem += 2; ghiChu.push('Bố sinh Mệnh Con (+2đ)');
      } else if (naCon.hanh === napAmBo.hanh) {
        diem += 1; ghiChu.push('Bố & Con đồng hành (+1đ)');
      } else if (KHAC[naCon.hanh] === napAmBo.hanh) {
        diem -= 3; ghiChu.push('Con khắc Mệnh Bố (-3đ)');
      }

      if (SINH[naCon.hanh] === napAmMe.hanh) {
        diem += 3; ghiChu.push('Con sinh Mệnh Mẹ (+3đ)');
      } else if (SINH[napAmMe.hanh] === naCon.hanh) {
        diem += 2; ghiChu.push('Mẹ sinh Mệnh Con (+2đ)');
      } else if (naCon.hanh === napAmMe.hanh) {
        diem += 1; ghiChu.push('Mẹ & Con đồng hành (+1đ)');
      } else if (KHAC[naCon.hanh] === napAmMe.hanh) {
        diem -= 3; ghiChu.push('Con khắc Mệnh Mẹ (-3đ)');
      }

      var hopBo = false, hopMe = false;
      for (var th = 0; th < TAM_HOP.length; th++) {
        if (TAM_HOP[th].indexOf(zCon) >= 0 && TAM_HOP[th].indexOf(chiBo) >= 0) hopBo = true;
        if (TAM_HOP[th].indexOf(zCon) >= 0 && TAM_HOP[th].indexOf(chiMe) >= 0) hopMe = true;
      }
      if (hopBo || LUC_HOP[zCon] === chiBo) { diem += 2; ghiChu.push('Hợp Chi với Bố (+2đ)'); }
      if (hopMe || LUC_HOP[zCon] === chiMe) { diem += 2; ghiChu.push('Hợp Chi với Mẹ (+2đ)'); }

      if (LUC_XUNG[zCon] === chiBo) { diem -= 3; ghiChu.push('Lục xung Chi với Bố (-3đ)'); }
      if (LUC_XUNG[zCon] === chiMe) { diem -= 3; ghiChu.push('Lục xung Chi với Mẹ (-3đ)'); }

      diem = Math.max(2, Math.min(20, diem));
      var danhGia = '';
      if (diem >= 16) danhGia = 'ĐẠI CÁT';
      else if (diem >= 13) danhGia = 'CÁT (Rất Tốt)';
      else if (diem >= 10) danhGia = 'BÌNH HÒA';
      else danhGia = 'HUNG (Nên tránh)';

      danhSachNam.push({
        nam: y,
        canChi: CAN[cCon] + ' ' + CHI[zCon],
        conGiap: CON_GIAP[zCon],
        napAm: naCon.ten + ' (' + naCon.hanh + ')',
        diem: diem,
        danhGia: danhGia,
        ghiChu: ghiChu.join(' • ')
      });
    }

    return danhSachNam;
  }

  // ==============================================================
  // TÍNH NĂNG TÌM / QUÉT NGÀY ĐẸP HỢP TUỔI ĐƯƠNG SỐ THEO MỤC ĐÍCH CÔNG VIỆC
  // ==============================================================
  function timNgayDepHopTuoi(duongSo, nam, thang, mucDich) {
    // duongSo: { can: canIdx, chi: chiIdx, hanh: hanhStr }
    var namVal = parseInt(nam, 10) || 2026;
    var thangVal = parseInt(thang, 10) || 11;
    var mucDichVal = mucDich || 'all';

    var daysInMonth = new Date(namVal, thangVal, 0).getDate();
    var ketQua = [];

    var MUC_DICH_TEN = {
      'all': 'Việc đại sự nói chung',
      'lamnha': 'Động thổ, làm nhà, nhập trạch, cất nóc',
      'cuoihoi': 'Cưới gả, đính hôn, rước dâu',
      'khaitruong': 'Khai trương, mở hàng, ký hợp đồng, cầu tài',
      'xuathanh': 'Xuất hành, đi xa, nhận chức',
      'antang': 'An táng, cải táng, việc âm phần'
    };

    for (var d = 1; d <= daysInMonth; d++) {
      var lDate = Lunar.solar2Lunar(d, thangVal, namVal);
      var jdn = Lunar.jdFromDate(d, thangVal, namVal);
      var canChiN = PT.getCanChiNgay(jdn);
      var napAmN = getNapAm(canChiN.can, canChiN.chi);
      var truc = PT.getTrucNgay(lDate.month, canChiN.chi);
      var hoangDao = PT.isNgayHoangDao(lDate.month, canChiN.chi);
      var sao28 = PT.getSao28(jdn);
      var dacBiet = PT.kiemTraNgayDacBiet(lDate.month, lDate.day, canChiN.can, canChiN.chi);

      // Điểm cơ bản từ ngũ hành & can chi hợp tuổi đương số (10 - 100đ)
      var dg = danhGiaNgayVoiDuongSo(canChiN, napAmN, duongSo);
      var diem = dg.diem;
      var uuDiem = [];
      var canhBao = [];

      // Điều chỉnh theo Hoàng Đạo / Hắc Đạo
      if (hoangDao) {
        diem += 8;
        uuDiem.push('Ngày Hoàng Đạo cát khí');
      } else {
        diem -= 6;
        canhBao.push('Ngày Hắc Đạo');
      }

      // Điều chỉnh theo Nhị thập bát tú
      if (sao28 && sao28.tinhChat === 'Tốt') {
        diem += 8;
        uuDiem.push('Sao ' + sao28.ten + ' cát tinh chiếu');
      } else if (sao28 && sao28.tinhChat === 'Xấu') {
        diem -= 10;
        canhBao.push('Sao ' + sao28.ten + ' hung tinh');
      }

      // Điều chỉnh theo 12 Trực
      if (truc && truc.tinhChat === 'Tốt') {
        diem += 6;
        uuDiem.push('Trực ' + truc.ten + ' thuận lợi');
      } else if (truc && truc.tinhChat === 'Xấu') {
        diem -= 8;
        canhBao.push('Trực ' + truc.ten + ' xấu');
      }

      // Trừ điểm mạnh nếu phạm các ngày đại kỵ dân gian
      if (dacBiet) {
        if (dacBiet.conNuoc.pham) {
          canhBao.push('Phạm Con Nước');
          if (mucDichVal === 'xuathanh' || mucDichVal === 'khaitruong' || mucDichVal === 'all') diem -= 25;
        }
        if (dacBiet.satChuDuong.pham) {
          canhBao.push('Phạm Sát Chủ Dương');
          if (mucDichVal === 'lamnha' || mucDichVal === 'cuoihoi' || mucDichVal === 'khaitruong' || mucDichVal === 'all') diem -= 35;
        }
        if (dacBiet.satChuAm.pham) {
          canhBao.push('Phạm Sát Chủ Âm');
          if (mucDichVal === 'antang' || mucDichVal === 'all') diem -= 40;
        }
        if (dacBiet.thuTu.pham) {
          canhBao.push('Phạm Thụ Tử');
          diem -= 35;
        }
        if (dacBiet.tamNuong.pham) {
          canhBao.push('Phạm Tam Nương (mùng ' + lDate.day + ')');
          if (mucDichVal === 'cuoihoi' || mucDichVal === 'lamnha' || mucDichVal === 'xuathanh' || mucDichVal === 'all') diem -= 25;
        }
        if (dacBiet.nguyetKy.pham) {
          canhBao.push('Phạm Nguyệt Kỵ (mùng ' + lDate.day + ')');
          diem -= 20;
        }
        if (dacBiet.duongCong.pham) {
          canhBao.push('Phạm Dương Công Kỵ Nhật');
          diem -= 40;
        }
      }

      // Phù hợp đặc thù theo mục đích
      if (truc) {
        var tTen = truc.ten;
        if (mucDichVal === 'lamnha') {
          if (tTen === 'Kiến' || tTen === 'Định' || tTen === 'Mãn' || tTen === 'Thành') { diem += 10; uuDiem.push('Trực ' + tTen + ' rất tốt làm nhà'); }
          if (tTen === 'Phá' || tTen === 'Bế' || tTen === 'Bình') { diem -= 15; canhBao.push('Trực ' + tTen + ' kỵ làm nhà'); }
        } else if (mucDichVal === 'cuoihoi') {
          if (tTen === 'Định' || tTen === 'Thành' || tTen === 'Khai') { diem += 10; uuDiem.push('Trực ' + tTen + ' đại cát cưới hỏi'); }
          if (tTen === 'Phá' || tTen === 'Bế' || tTen === 'Nguy') { diem -= 15; canhBao.push('Trực ' + tTen + ' kỵ giá thú'); }
        } else if (mucDichVal === 'khaitruong') {
          if (tTen === 'Khai' || tTen === 'Mãn' || tTen === 'Thành') { diem += 10; uuDiem.push('Trực ' + tTen + ' phát tài khai trương'); }
          if (tTen === 'Phá' || tTen === 'Bế' || tTen === 'Thâu') { diem -= 15; canhBao.push('Trực ' + tTen + ' kỵ mở hàng'); }
        } else if (mucDichVal === 'xuathanh') {
          if (tTen === 'Khai' || tTen === 'Trừ' || tTen === 'Thành') { diem += 10; uuDiem.push('Trực ' + tTen + ' hanh thông xuất hành'); }
          if (tTen === 'Bế' || tTen === 'Nguy') { diem -= 15; canhBao.push('Trực ' + tTen + ' kỵ đi xa'); }
        } else if (mucDichVal === 'antang') {
          if (tTen === 'Bế' || tTen === 'Trừ') { diem += 10; uuDiem.push('Trực ' + tTen + ' an táng yên ổn'); }
          if (tTen === 'Khai' || tTen === 'Kiến' || tTen === 'Phá') { diem -= 20; canhBao.push('Trực ' + tTen + ' kỵ an táng'); }
        }
      }

      diem = Math.max(5, Math.min(100, Math.round(diem)));
      var xepLoai = '';
      var cls = '';
      if (diem >= 80) {
        xepLoai = 'ĐẠI CÁT';
        cls = 'good';
      } else if (diem >= 65) {
        xepLoai = 'CÁT (Tốt)';
        cls = 'good';
      } else if (diem >= 50) {
        xepLoai = 'Bình Hòa';
        cls = 'gold';
      } else {
        xepLoai = 'HUNG (Nên tránh)';
        cls = 'bad';
      }

      var gList = PT.getGioHoangDao(canChiN.chi) || [];
      var gioDepStr = gList.map(function(g) { return g.tenChi; }).join(', ');

      var dStr = (d < 10 ? '0' : '') + d;
      var mStr = (thangVal < 10 ? '0' : '') + thangVal;
      var dateKey = namVal + '-' + mStr + '-' + dStr;

      ketQua.push({
        ngayDuong: dStr + '/' + mStr + '/' + namVal,
        dateKey: dateKey,
        ngayAm: (lDate.day < 10 ? '0' : '') + lDate.day + '/' + (lDate.month < 10 ? '0' : '') + lDate.month + (lDate.leap ? ' (Nhuận)' : ''),
        canChiNgay: canChiN.ten,
        napAmNgay: napAmN.ten + ' (' + napAmN.hanh + ')',
        diem: diem,
        xepLoai: xepLoai,
        cls: cls,
        hoangDao: hoangDao,
        truc: truc ? truc.ten : '',
        sao28: sao28 ? sao28.ten : '',
        gioHoangDao: gioDepStr,
        uuDiem: uuDiem.join(', '),
        canhBao: canhBao.length > 0 ? canhBao.join(', ') : 'Không phạm ngày kỵ lớn',
        laNgayDep: diem >= 65
      });
    }

    // Sắp xếp: ưu tiên ngày điểm cao nhất lên đầu
    ketQua.sort(function(a, b) {
      return b.diem - a.diem;
    });

    return {
      nam: namVal,
      thang: thangVal,
      mucDich: mucDichVal,
      tenMucDich: MUC_DICH_TEN[mucDichVal] || 'Công việc',
      danhSach: ketQua,
      tongNgay: ketQua.length,
      soNgayDep: ketQua.filter(function(k) { return k.laNgayDep; }).length
    };
  }

  root.LogicTT = {
    getNapAm: getNapAm,
    danhGiaNgayVoiDuongSo: danhGiaNgayVoiDuongSo,
    tinhBatTuTuTru: tinhBatTuTuTru,
    tinhTrungTang: tinhTrungTang,
    tinhKeHoachSinhCon: tinhKeHoachSinhCon,
    timNgayDepHopTuoi: timNgayDepHopTuoi,
    quanHeMenh: quanHeMenh
  };

  root.Tuoi = root.Tuoi || {};
  root.Tuoi.quanHeMenh = quanHeMenh;

})(typeof window !== 'undefined' ? window : globalThis);
