/* Dữ liệu & logic tra tuổi: can chi, nạp âm, cung mệnh, hợp/xung, tuổi mụ, hạn */
(function (root) {
  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var CON_GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];
  var CON_ICON = ['🐭', '🐮', '🐯', '🐱', '🐲', '🐍', '🐴', '🐐', '🐵', '🐔', '🐶', '🐷'];

  // 30 cặp nạp âm theo vòng Lục thập hoa giáp (mỗi 2 năm liên tiếp)
  var NAP_AM = [
    ['Hải trung kim', 'Vàng trong biển', 'Kim'], ['Lư trung hỏa', 'Lửa trong lò', 'Hỏa'],
    ['Đại lâm mộc', 'Gỗ rừng lớn', 'Mộc'], ['Lộ bàng thổ', 'Đất ven đường', 'Thổ'],
    ['Kiếm phong kim', 'Vàng mũi kiếm', 'Kim'], ['Sơn đầu hỏa', 'Lửa trên núi', 'Hỏa'],
    ['Giản hạ thủy', 'Nước dưới khe', 'Thủy'], ['Thành đầu thổ', 'Đất trên thành', 'Thổ'],
    ['Bạch lạp kim', 'Vàng chân đèn', 'Kim'], ['Dương liễu mộc', 'Gỗ cây dương liễu', 'Mộc'],
    ['Tuyền trung thủy', 'Nước giữa suối', 'Thủy'], ['Ốc thượng thổ', 'Đất nóc nhà', 'Thổ'],
    ['Tích lịch hỏa', 'Lửa sấm sét', 'Hỏa'], ['Tùng bách mộc', 'Gỗ tùng bách', 'Mộc'],
    ['Trường lưu thủy', 'Nước chảy dài', 'Thủy'], ['Sa trung kim', 'Vàng trong cát', 'Kim'],
    ['Sơn hạ hỏa', 'Lửa chân núi', 'Hỏa'], ['Bình địa mộc', 'Gỗ đồng bằng', 'Mộc'],
    ['Bích thượng thổ', 'Đất trên tường', 'Thổ'], ['Kim bạch kim', 'Vàng pha bạc', 'Kim'],
    ['Phú đăng hỏa', 'Lửa đèn to', 'Hỏa'], ['Thiên hà thủy', 'Nước trên trời', 'Thủy'],
    ['Đại trạch thổ', 'Đất nền nhà', 'Thổ'], ['Thoa xuyến kim', 'Vàng trang sức', 'Kim'],
    ['Tang đố mộc', 'Gỗ cây dâu', 'Mộc'], ['Đại khê thủy', 'Nước khe lớn', 'Thủy'],
    ['Sa trung thổ', 'Đất pha cát', 'Thổ'], ['Thiên thượng hỏa', 'Lửa trên trời', 'Hỏa'],
    ['Thạch lựu mộc', 'Gỗ cây lựu', 'Mộc'], ['Đại hải thủy', 'Nước biển lớn', 'Thủy']
  ];
  // Ngũ hành tương sinh / tương khắc
  var SINH = { 'Kim': 'Thủy', 'Thủy': 'Mộc', 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim' };
  var KHAC = { 'Kim': 'Mộc', 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim' };

  var CUNG = {
    1: { ten: 'Khảm', hanh: 'Thủy', nhom: 'Đông tứ mệnh', sinhKhi: 'Đông Nam', thienY: 'Đông', dienNien: 'Nam', phucVi: 'Bắc' },
    2: { ten: 'Khôn', hanh: 'Thổ', nhom: 'Tây tứ mệnh', sinhKhi: 'Đông Bắc', thienY: 'Tây', dienNien: 'Tây Bắc', phucVi: 'Tây Nam' },
    3: { ten: 'Chấn', hanh: 'Mộc', nhom: 'Đông tứ mệnh', sinhKhi: 'Nam', thienY: 'Bắc', dienNien: 'Đông Nam', phucVi: 'Đông' },
    4: { ten: 'Tốn', hanh: 'Mộc', nhom: 'Đông tứ mệnh', sinhKhi: 'Bắc', thienY: 'Nam', dienNien: 'Đông', phucVi: 'Đông Nam' },
    6: { ten: 'Càn', hanh: 'Kim', nhom: 'Tây tứ mệnh', sinhKhi: 'Tây', thienY: 'Đông Bắc', dienNien: 'Tây Nam', phucVi: 'Tây Bắc' },
    7: { ten: 'Đoài', hanh: 'Kim', nhom: 'Tây tứ mệnh', sinhKhi: 'Tây Bắc', thienY: 'Tây Nam', dienNien: 'Đông Bắc', phucVi: 'Tây' },
    8: { ten: 'Cấn', hanh: 'Thổ', nhom: 'Tây tứ mệnh', sinhKhi: 'Tây Nam', thienY: 'Tây Bắc', dienNien: 'Tây', phucVi: 'Đông Bắc' },
    9: { ten: 'Ly', hanh: 'Hỏa', nhom: 'Đông tứ mệnh', sinhKhi: 'Đông', thienY: 'Đông Nam', dienNien: 'Bắc', phucVi: 'Nam' }
  };

  var TAM_HOP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
  var TAM_TAI = { 0: [2, 3, 4], 1: [5, 6, 7], 2: [8, 9, 10], 3: [11, 0, 1] }; // theo nhóm tam hợp -> 3 chi năm tam tai
  var TU_HANH_XUNG = [[0, 6, 3, 9], [2, 8, 5, 11], [4, 10, 1, 7]];
  var LUC_HOP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  var LUC_HAI = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];

  function mod(a, n) { return ((a % n) + n) % n; }
  function canChiNam(y) { return { can: mod(y + 6, 10), chi: mod(y + 8, 12) }; }
  function tenCanChi(c) { return CAN[c.can] + ' ' + CHI[c.chi]; }
  function chiList(arr) { return arr.map(function (i) { return CHI[i]; }); }

  function napAm(c) {
    for (var n = 0; n < 60; n++) if (n % 10 === c.can && n % 12 === c.chi) return NAP_AM[Math.floor(n / 2)];
  }
  function rutGon(n) { n = mod(n, 9); return n === 0 ? 9 : n; }
  function cungMenh(lunarYear, gioiTinh) {
    var s = String(lunarYear).split('').reduce(function (a, d) { return a + Number(d); }, 0);
    var r = rutGon(s), k;
    var sau2000 = lunarYear >= 2000;
    if (gioiTinh === 'nam') k = rutGon(sau2000 ? 9 - r : 11 - r);
    else k = rutGon(sau2000 ? r + 6 : r + 4);
    if (k === 5) k = gioiTinh === 'nam' ? 2 : 8;
    return { so: k, info: CUNG[k] };
  }
  function nhomTamHop(chi) { for (var i = 0; i < TAM_HOP.length; i++) if (TAM_HOP[i].indexOf(chi) >= 0) return i; }
  function quanHeChi(chi) {
    var tamHop = TAM_HOP[nhomTamHop(chi)].filter(function (x) { return x !== chi; });
    var lucHop = []; LUC_HOP.forEach(function (p) { if (p[0] === chi) lucHop.push(p[1]); else if (p[1] === chi) lucHop.push(p[0]); });
    var lucXung = [mod(chi + 6, 12)];
    var tuXung = []; TU_HANH_XUNG.forEach(function (g) { if (g.indexOf(chi) >= 0) tuXung = g.filter(function (x) { return x !== chi && x !== lucXung[0]; }); });
    var hai = []; LUC_HAI.forEach(function (p) { if (p[0] === chi) hai.push(p[1]); else if (p[1] === chi) hai.push(p[0]); });
    return { tamHop: chiList(tamHop), lucHop: chiList(lucHop), lucXung: chiList(lucXung), tuHanhXung: chiList(tuXung), tuongHai: chiList(hai) };
  }
  function quanHeMenh(h1, h2) {
    if (h1 === h2) return 'Tương hòa (cùng hành)';
    if (SINH[h1] === h2) return h1 + ' sinh ' + h2 + ' (tương sinh)';
    if (SINH[h2] === h1) return h2 + ' sinh ' + h1 + ' (tương sinh)';
    if (KHAC[h1] === h2) return h1 + ' khắc ' + h2 + ' (tương khắc)';
    return h2 + ' khắc ' + h1 + ' (tương khắc)';
  }
  function kimLau(tuoiMu) {
    var r = tuoiMu % 9;
    var m = { 1: 'Kim Lâu Thân', 3: 'Kim Lâu Thê', 6: 'Kim Lâu Tử', 8: 'Kim Lâu Súc' };
    return m[r] || null;
  }
  function tamTai(chiSinh, namXet) {
    var nhom = nhomTamHop(chiSinh);
    return TAM_TAI[nhom].indexOf(mod(namXet + 8, 12)) >= 0;
  }
  function thienCan(c) { return c; }

  function tra(opt) {
    // opt: {d,m,y, gioiTinh, xet:{d,m,y}}
    var lunar = Lunar.solar2Lunar(opt.d, opt.m, opt.y);
    var cc = canChiNam(lunar.year);
    var na = napAm(cc);
    var cung = cungMenh(lunar.year, opt.gioiTinh);
    var xet = Lunar.solar2Lunar(opt.xet.d, opt.xet.m, opt.xet.y);
    var tuoiMu = xet.year - lunar.year + 1;
    var ngay = new Date(opt.y, opt.m - 1, opt.d), now = new Date(opt.xet.y, opt.xet.m - 1, opt.xet.d);
    var tuoiDuong = now.getFullYear() - ngay.getFullYear();
    if (now.getMonth() < ngay.getMonth() || (now.getMonth() === ngay.getMonth() && now.getDate() < ngay.getDate())) tuoiDuong--;
    var ccXet = canChiNam(xet.year);
    return {
      lunar: lunar, canChi: tenCanChi(cc), chi: cc.chi, conGiap: CON_GIAP[cc.chi], icon: CON_ICON[cc.chi],
      napAm: na, cung: cung, quanHe: quanHeChi(cc.chi),
      tuoiMu: tuoiMu, tuoiDuong: tuoiDuong, namXet: xet.year, canChiXet: tenCanChi(ccXet),
      kimLau: kimLau(tuoiMu), tamTai: tamTai(cc.chi, xet.year),
      soNgaySong: Math.floor((now - ngay) / 86400000)
    };
  }
  root.Tuoi = { tra: tra, canChiNam: canChiNam, tenCanChi: tenCanChi, quanHeMenh: quanHeMenh, napAm: napAm, CHI: CHI, CAN: CAN, CON_GIAP: CON_GIAP, SINH: SINH, KHAC: KHAC, tamTai: tamTai };
  if (typeof module !== 'undefined') module.exports = root.Tuoi;
})(typeof window !== 'undefined' ? window : globalThis);
