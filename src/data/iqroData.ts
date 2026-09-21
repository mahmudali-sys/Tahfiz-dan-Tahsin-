import { IqroJilid, IqroMaterialAspect, IqroStatus, TahsinGrade, IqroJilidRecord } from '../types';
import { getPredicate } from './quranData';

export type { IqroJilid, IqroMaterialAspect, IqroStatus, TahsinGrade, IqroJilidRecord };

export interface IqroJilidMetadata {
  jilid: IqroJilid;
  title: string;
  subtitle: string;
  totalPages: number;
  author: string;
  publisher: string;
  summary: string;
  coreMaterials: {
    key: string;
    name: string;
    criteria: string;
    description: string;
    pageRange: string;
  }[];
  ebtaTarget: string; // Target EBTA Kenaikan Jilid
}

export const IQRO_AMM_JILID_DATA: Record<IqroJilid, IqroJilidMetadata> = {
  1: {
    jilid: 1,
    title: "Iqro' Jilid 1",
    subtitle: "Pengenalan Huruf Tunggal Hijaiyyah Fathah (A - Ba s.d. Ha - Ya)",
    totalPages: 36,
    author: "K.H. As'ad Humam",
    publisher: "Balai Litbang LPTQ Nasional / Team Tadarus \"AMM\" Yogyakarta",
    summary: "Fokus pada pengenalan huruf hijaiyyah tunggal berharakat fathah (أ s.d. ي) secara CBSA (Cara Belajar Santri Aktif), langsung bersuara tanpa dieja, dibaca dengan suara pendek-pendek 1 ketukan (tidak boleh dipanjang-panjangkan/diseret), serta ketepatan membedakan makhraj huruf serupa.",
    coreMaterials: [
      {
        key: "j1_huruf_tunggal",
        name: "Pengenalan & Artikulasi Huruf Tunggal Hijaiyyah Fathah (A s.d. Ya)",
        criteria: "Kelancaran membaca huruf hijaiyyah tunggal berharakat fathah secara langsung tanpa mengeja (A - Ba - Ta...).",
        description: "Santri membaca spontan setiap huruf tunggal tanpa dieja dengan artikulasi makhraj yang jelas.",
        pageRange: "Hal. 1 - 33",
      },
      {
        key: "j1_suara_pendek",
        name: "Disiplin Suara Pendek-Pendek 1 Ketukan (Tidak Boleh Diseret)",
        criteria: "Ketepatan membaca 1 ketukan pendek secara tegas dan konsisten tanpa dipanjangkan atau diayun.",
        description: "Santri dilarang keras memanjangkan bacaan yang seharusnya pendek (dibaca putus-putus bila berpikir).",
        pageRange: "Hal. 1 - 33",
      },
      {
        key: "j1_makhraj_serupa",
        name: "Ketepatan Membedakan Makhraj Pasangan Huruf Serupa / Berdekatan",
        criteria: "Presisi membedakan bunyi pasangan huruf serupa: (أ - ع), (ح - هـ), (ج - ز), (ث - س - ش), (ص - س), (ت - ط), (د - ض), (ذ - ز - ظ), (خ - غ - ق).",
        description: "Menghindari tertukarnya huruf tebal/tipis, desis, serta huruf tenggorokan yang berdekatan makhrajnya.",
        pageRange: "Hal. 34",
      },
      {
        key: "j1_ebta_kelancaran",
        name: "Evaluasi Belajar Tahap Akhir (EBTA) Jilid 1 (Lancar & Benar)",
        criteria: "Kelulusan membaca huruf acak berharakat fathah secara lancar, spontan, dan benar seluruh makhrajnya.",
        description: "Bila sudah lancar dan benar makhrajnya, santri dinyatakan Lulus dan boleh dinaikkan ke Jilid 2.",
        pageRange: "Hal. 35",
      },
    ],
    ebtaTarget: "Lulus EBTA Halaman 35: Lancar membaca huruf hijaiyyah acak berharakat fathah secara spontan dan benar makhrajnya tanpa mengeja.",
  },
  2: {
    jilid: 2,
    title: "Iqro' Jilid 2",
    subtitle: "Huruf Bersambung & Disiplin Mad Thobi'i Fathah (Panjang 2 Harakat)",
    totalPages: 32,
    author: "K.H. As'ad Humam",
    publisher: "Balai Litbang LPTQ Nasional / Team Tadarus \"AMM\" Yogyakarta",
    summary: "Fokus pada pengenalan huruf hijaiyyah saat dirangkai bersambung (awal, tengah, dan akhir kata) serta penerapan kaidah Mad Thobi'i (fathah diikuti alif / alif tegak) dibaca panjang 2 harakat dengan disiplin mutlak membedakan panjang dan pendek.",
    coreMaterials: [
      {
        key: "j2_huruf_sambung",
        name: "Rangkaian Huruf Bersambung di Awal, Tengah, dan Akhir Kata",
        criteria: "Ketepatan mengenali bentuk perubahan kepala huruf dan titik saat dirangkai bersambung serta huruf yang tidak bisa disambung ke kiri.",
        description: "Santri membaca lancar kata-kata berhuruf sambung secara spontan tanpa mengeja.",
        pageRange: "Hal. 1 - 15",
      },
      {
        key: "j2_mad_thobii",
        name: "Kaidah Bacaan Mad / Panjang 2 Harakat (Fathah + Alif / Fathah Berdiri)",
        criteria: "Penerapan panjang 2 harakat (1 alif) secara pas dan proporsional saat fathah diikuti alif atau fathah tegak (ــَا = aa, بَا = baa).",
        description: "Santri memanjangkan bacaan tepat 2 harakat, tidak kurang dan tidak berlebihan.",
        pageRange: "Hal. 16 - 28",
      },
      {
        key: "j2_disiplin_panjang_pendek",
        name: "Disiplin Mutlak Membedakan Panjang (2 Harakat) vs Pendek (1 Harakat)",
        criteria: "Ketelitian tinggi membedakan huruf panjang dan pendek; menghilangkan kesalahan memendekkan mad atau memanjangkan yang pendek.",
        description: "Kaidah mutlak buku Iqro': Keliru baca panjang-pendek adalah KESALAHAN BESAR yang wajib dihindari.",
        pageRange: "Hal. 16 - 31",
      },
      {
        key: "j2_ebta_kelancaran",
        name: "Evaluasi Belajar Tahap Akhir (EBTA) Jilid 2 (Makhraj & Mad Tepat)",
        criteria: "Kemampuan membaca kalimat sambung dengan makhraj yang benar (walau pelan) dan betul semua panjang-pendeknya.",
        description: "Bila bacaan telah benar makhrajnya dan betul semua panjang-pendeknya, santri boleh naik ke Jilid 3.",
        pageRange: "Hal. 32",
      },
    ],
    ebtaTarget: "Lulus EBTA Halaman 32: Membaca kalimat bersambung dengan konsisten membedakan panjang 2 harakat dan pendek 1 harakat serta makhraj benar.",
  },
  3: {
    jilid: 3,
    title: "Iqro' Jilid 3",
    subtitle: "Harakat Kasrah, Dhammah, Mad Asli (Kasrah-Ya' & Dhammah-Wawu), serta Ha Dhamir",
    totalPages: 32,
    author: "K.H. As'ad Humam",
    publisher: "Balai Litbang LPTQ Nasional / Team Tadarus \"AMM\" Yogyakarta",
    summary: "Fokus pada pengenalan harakat Kasrah (ـِ / i) dan Dhammah (ـُ / u), kaidah Mad Thobi'i kasrah bertemu ya' sukun (ـِيْ / ii) dan dhammah bertemu wawu sukun (ـُوْ / uu), pengenalan bentuk Ha Dhamir (ـهِ, ـهُ) dan Ta Marbuthah, serta kaidah Wawu Jama'ah + Alif Fariqah (قَالُوْا).",
    coreMaterials: [
      {
        key: "j3_kasrah_mad_ya",
        name: "Harakat Kasrah (ـِ = i) & Mad Thobi'i Kasrah-Ya' Sukun (ـِيْ = ii)",
        criteria: "Kemurnian bunyi kasrah ('i' murni, bukan 'e') dan kestabilan panjang 2 harakat saat kasrah diikuti ya' sukun.",
        description: "Santri membaca harakat kasrah pendek secara jernih dan memanjangkan 2 harakat saat bertemu ya' sukun.",
        pageRange: "Hal. 1 - 15",
      },
      {
        key: "j3_ha_dhamir_ta_marbuthah",
        name: "Bentuk Huruf Ha Dhamir (ـهِ / هِ = hii) & Ta Marbuthah (ـة / ة)",
        criteria: "Ketepatan mengenali bentuk ha dhamir kasrah panjang 2 harakat dan pengenalan huruf ta marbuthah.",
        description: "Santri lancar melafalkan ha dhamir dan membedakan bentuk ta marbuthah di akhir kata.",
        pageRange: "Hal. 8 - 12",
      },
      {
        key: "j3_dhammah_mad_wawu",
        name: "Harakat Dhammah (ـُ = u) & Mad Thobi'i Dhammah-Wawu Sukun (ـُوْ = uu)",
        criteria: "Kemurnian bunyi dhammah bulat ('u' murni, bukan 'o') dan kestabilan panjang 2 harakat saat dhammah bertemu wawu sukun.",
        description: "Bibir dimoncongkan bulat sempurna saat mengucap dhammah dan mad wawu sukun 2 harakat.",
        pageRange: "Hal. 16 - 20",
      },
      {
        key: "j3_wawu_jamaah_mad_shilah",
        name: "Kaidah Wawu Jama'ah + Alif Fariqah (قَالُوْا) & Ha Dhamir (ـهُ = huu)",
        criteria: "Pemahaman bahwa alif setelah wawu jama'ah dianggap tidak ada (tetap 2 harakat) serta ha dhamir dhammah terbalik 2 harakat.",
        description: "Santri tidak keliru memanjangkan alif fariqah dan membaca ha dhamir secara tepat.",
        pageRange: "Hal. 20 - 25",
      },
      {
        key: "j3_ebta_kelancaran",
        name: "Evaluasi Belajar Tahap Akhir (EBTA) Jilid 3 (Kombinasi 3 Harakat & Mad)",
        criteria: "Kelancaran membaca variasi kombinasi tiga harakat (A - I - U) dan kestabilan seluruh panjang-pendek tanpa tersendat.",
        description: "Bila masih keliru panjang-pendek: STOP! Jangan dinaikkan! Sabarlah mengulang hingga benar semuanya.",
        pageRange: "Hal. 31 - 32",
      },
    ],
    ebtaTarget: "Lulus EBTA Halaman 31-32: Benar dan mantap membedakan variasi 3 harakat (A-I-U) serta mad asli (alif, ya', wawu) tanpa kesalahan panjang-pendek.",
  },
  4: {
    jilid: 4,
    title: "Iqro' Jilid 4",
    subtitle: "Tanwin (an, in, un), Huruf Bersukun (Mati), Huruf Lin, & Pantulan Qalqalah",
    totalPages: 32,
    author: "K.H. As'ad Humam",
    publisher: "Balai Litbang LPTQ Nasional / Team Tadarus \"AMM\" Yogyakarta",
    summary: "Fokus pada pengenalan harakat Tanwin (fathatain ـًـ, kasratain ـٍـ, dhammatain ـٌـ dibaca pendek), pengenalan huruf lin (ـَوْ dan ـَيْ), huruf berharakat sukun (ـْ) termasuk mim sukun dan nun sukun jelas, serta sifat pantulan Qalqalah pada huruf (ب, ج, د, ط, ق = BAJU DI THOQO).",
    coreMaterials: [
      {
        key: "j4_tanwin",
        name: "Harakat Tanwin (Fathatain ـًـ, Kasratain ـٍـ, Dhammatain ـٌـ)",
        criteria: "Ketepatan bunyi tanwin (an, in, un) secara tegas dan pendek tanpa menyeret alif penyangga.",
        description: "Santri melafalkan bunyi tanwin secara spontan dan membedakan tanwin dengan huruf mad.",
        pageRange: "Hal. 1 - 8",
      },
      {
        key: "j4_huruf_lin",
        name: "Pelafalan Huruf Lin: Fathah Diikuti Ya' Sukun (ـَيْ / ai) & Wawu Sukun (ـَوْ / au)",
        criteria: "Ketepatan melafalkan bunyi lin secara lemas dan halus tanpa hentakan (misal: aina, kaifa, khauf, yaum).",
        description: "Santri membaca huruf lin secara mengalir dan membedakannya dari mad thobi'i murni.",
        pageRange: "Hal. 9 - 14",
      },
      {
        key: "j4_sukun_konsonan",
        name: "Pengenalan Huruf Bersukun (Mati): Mim Sukun (ـمْ), Nun Sukun (ـنْ), & Hamzah Sukun (ـأْ)",
        criteria: "Membaca huruf sukun secara tegas tanpa memantul pada huruf non-qalqalah serta membedakan bunyi (تَأْ, تَعْ, تَكْ, تَقْ).",
        description: "Ketepatan mengunci suara pada huruf mati tanpa memantulkan huruf lam, kaf, fa, ta, atau mim sukun.",
        pageRange: "Hal. 13 - 27",
      },
      {
        key: "j4_qalqalah",
        name: "Penerapan Pantulan Huruf Qalqalah Sukun (ب, ج, د, ط, ق - BAJU DI THOQO)",
        criteria: "Ketepatan memantulkan bunyi huruf qalqalah berharakat sukun di tengah kata secara jernih dan tegas.",
        description: "Santri menghasilkan pantulan alami pada ba', jim, dal, tha', qaf sukun tanpa menambahkan bunyi vokal baru.",
        pageRange: "Hal. 18 - 25",
      },
      {
        key: "j4_ebta_kelancaran",
        name: "Evaluasi Belajar Tahap Akhir (EBTA) Jilid 4 (Makhraj, Mad, Qalqalah, Pembeda Huruf)",
        criteria: "Penguasaan utuh 4 pilar EBTA Jilid 4: Makhraj huruf, Mad (panjang-pendek), Qalqalah, dan membedakan bunyi (أ, ع, ك, ق).",
        description: "Santri dinyatakan lulus bila seluruh aspek sukun, tanwin, qalqalah, dan mad telah tepat.",
        pageRange: "Hal. 31 - 32",
      },
    ],
    ebtaTarget: "Lulus EBTA Halaman 31-32: Menguasai secara mantap 4 pilar EBTA Jilid 4: Makhraj, Mad, Qalqalah, dan pembedaan huruf (أ, ع, ك, ق).",
  },
  5: {
    jilid: 5,
    title: "Iqro' Jilid 5",
    subtitle: "Alif Lam, Kaidah Waqaf, Tasydid, Ghunnah Musyaddadah, & Mad Bendera",
    totalPages: 32,
    author: "K.H. As'ad Humam",
    publisher: "Balai Litbang LPTQ Nasional / Team Tadarus \"AMM\" Yogyakarta",
    summary: "Fokus pada Alif Lam Qamariyyah (اَلْـ jelas) & Hamzah Washal, kaidah waqaf (mematikan huruf akhir, Mad 'Iwadl tanwin fathah 2 harakat, ta marbuthah menjadi ha sukun), harakat tasydid (ـّ) ditekan dan ditahan, Ghunnah Musyaddadah pada nun & mim tasydid (نّ dan مّ berdengung 2 harakat), Alif Lam Syamsiyyah, mad bendera 4-5 harakat, serta lafadz Jalalah tebal/tipis.",
    coreMaterials: [
      {
        key: "j5_aliflam_qamariyyah",
        name: "Alif Lam Qamariyyah (اَلْـ Dibaca Jelas) & Hamzah Washal",
        criteria: "Membaca lam sukun secara jelas pada alif lam qamariyyah dan memahami hamzah washal di tengah kata yang alifnya dilewati.",
        description: "Santri membaca 'Al-Hamdu' secara tegas dan tidak membaca alif di tengah kalimat bersambung.",
        pageRange: "Hal. 1 - 4",
      },
      {
        key: "j5_waqaf",
        name: "Kaidah Waqaf: Mematikan Huruf Akhir, Mad 'Iwadl (2 Harakat), & Ta' Marbuthah (هـْ)",
        criteria: "Ketepatan waqaf: mensukunkan huruf akhir, mengubah tanwin fathah menjadi panjang 2 harakat (ـًا = aa), dan mengubah ta marbuthah (ة) menjadi ha sukun (هـْ).",
        description: "Santri mematuhi cara berhenti yang benar pada akhir kata atau ayat.",
        pageRange: "Hal. 5 - 10",
      },
      {
        key: "j5_mad_bendera",
        name: "Mad Wajib Muttashil, Mad Jaiz Munfashil (Tanda Bendera ~ 4-5 Harakat), & Mad Lazim (6 Harakat)",
        criteria: "Memanjangkan bacaan 4-5 harakat saat melihat tanda bendera (ـٓ) dan 6 harakat pada mad lazim sebelum tasydid (misal: وَلَا الضَّآلِّيْنَ).",
        description: "Santri membedakan panjang mad bendera (4-5 harakat) dan mad lazim (6 harakat) dari mad thobi'i biasa (2 harakat).",
        pageRange: "Hal. 11, 29",
      },
      {
        key: "j5_tasydid_ghunnah",
        name: "Harakat Tasydid (ـّ) Ditekan & Ghunnah Musyaddadah (نّ dan مّ Berdengung 2 Harakat)",
        criteria: "Memberikan hak tasydid dengan ditekan dan ditahan 2 harakat serta menahan dengung sempurna pada nun dan mim bertasydid.",
        description: "Santri tidak tergesa-gesa pada huruf bertasydid dan menahan dengung 2 harakat pada ghunnah musyaddadah.",
        pageRange: "Hal. 12, 16 - 19",
      },
      {
        key: "j5_idgham_syamsiyyah_jalalah",
        name: "Alif Lam Syamsiyyah, Idgham Bighunnah/Bilaghunnah, Ikhfa' Syafawi, & Lafadz Jalalah",
        criteria: "Meleburkan lam pada alif lam syamsiyyah, dengung pada idgham & ikhfa syafawi, serta melafalkan Allah tebal (LOH) vs tipis (LAH).",
        description: "Penerapan hukum tajwid terpadu jilid 5 secara praktis dan tepat.",
        pageRange: "Hal. 13 - 28",
      },
      {
        key: "j5_ebta_kelancaran",
        name: "Evaluasi Belajar Tahap Akhir (EBTA) Jilid 5 (Kelancaran Ayat Berwaqaf & Bertasydid)",
        criteria: "Kelulusan membaca ayat-ayat Al-Qur'an bersambung berwaqaf, bertasydid, dan berghunnah secara benar (walaupun pelan).",
        description: "Bila telah benar semuanya walaupun pelan pembacanya, santri dinyatakan Lulus dan dinaikkan ke Jilid 6.",
        pageRange: "Hal. 31 - 32",
      },
    ],
    ebtaTarget: "Lulus EBTA Halaman 31-32: Mahir membaca ayat bersambung berwaqaf, bertasydid, berghunnah musyaddadah, dan mad bendera secara benar.",
  },
  6: {
    jilid: 6,
    title: "Iqro' Jilid 6",
    subtitle: "Hukum Nun Mati/Tanwin, Tanda Waqaf Mushaf, Qalqalah Kubra, & Khatam Iqro'",
    totalPages: 32,
    author: "K.H. As'ad Humam",
    publisher: "Balai Litbang LPTQ Nasional / Team Tadarus \"AMM\" Yogyakarta",
    summary: "Fokus pada hukum tajwid aplikatif: Nun Sukun & Tanwin (Idgham Bighunnah, Iqlab, Ikhfa' Haqiqi 15 huruf dengan dengung 2 harakat), Tanda-Tanda Waqaf Mushaf Al-Qur'an (م, قلى, ج, صلى, لا, ∴), cara mewaqafkan huruf bertasydid dan Qalqalah Kubra bertasydid, huruf-huruf Muqaththa'ah awal surat, serta Khatam Iqro' menuju Tadarus Mushaf Al-Qur'an 30 Juz.",
    coreMaterials: [
      {
        key: "j6_nun_sukun_tanwin",
        name: "Hukum Nun Sukun & Tanwin (Idgham Bighunnah, Iqlab, & Ikhfa' Haqiqi)",
        criteria: "Ketepatan hukum nun sukun/tanwin: lebur berdengung (Idgham Bighunnah pada و, ي, ن, م), membalik suara mim berdengung (Iqlab pada ب), dan menyamarkan bunyi nun dengan dengung 2 harakat (Ikhfa' Haqiqi pada 15 huruf).",
        description: "Kaidah dengung 2 harakat pada idgham, iqlab, dan ikhfa' diterapkan secara disiplin dan konsisten.",
        pageRange: "Hal. 1 - 20",
      },
      {
        key: "j6_tanda_waqaf_mushaf",
        name: "Pemahaman & Ketaatan Tanda-Tanda Waqaf Mushaf Al-Qur'an",
        criteria: "Kepatuhan tanda waqaf mushaf: م (harus waqaf), قلى (berhenti lebih utama), ج (boleh waqaf/terus), صلى (dibaca terus lebih utama), لا (bukan tempat waqaf), dan ∴ (berhenti di salah satu tanda).",
        description: "Santri memahami fungsi praktis tanda waqaf mushaf dan mematuhinya saat tilawah.",
        pageRange: "Hal. 21 - 22",
      },
      {
        key: "j6_waqaf_tasydid_qalqalah",
        name: "Kaidah Mewaqafkan Huruf Bertasydid, Qalqalah Kubra Bertasydid, & Mad 'Aridh",
        criteria: "Mewaqafkan huruf bertasydid dengan suara ditekan dan ditahan 2 harakat, memantulkan qalqalah kubra tebal saat waqaf (misal: وَتَبَّ), dan mad 'aridh lissukun.",
        description: "Pemberian hak huruf waqaf bertasydid secara mantap dan sempurna.",
        pageRange: "Hal. 23 - 27",
      },
      {
        key: "j6_huruf_awal_surat",
        name: "Pelafalan Huruf-huruf Muqaththa'ah Awal Surat (Fawatihussuwar)",
        criteria: "Kefasihan membaca huruf-huruf tunggal pembuka surat Al-Qur'an (الم, المر, المص, كهيعص, طه, طسم, طس, يس, ص, حم, عسق, ق, ن) sesuai panjang harakat aslinya.",
        description: "Santri melafalkan nama huruf awal surat secara tepat dengan mad lazim harfi 6 harakat.",
        pageRange: "Hal. 28",
      },
      {
        key: "j6_khatam_tadarus",
        name: "Kelulusan Khatam Iqro' AMM Yogyakarta & Kesiapan Tadarus Al-Qur'an 30 Juz",
        criteria: "Kelancaran, kefasihan, ketartilan, dan adab membaca lembaran ayat-ayat panjang Al-Qur'an (EBTA Jilid 6 Hal. 29-32) dan dinyatakan LULUS Khatam Buku Iqro' AMM Yogyakarta.",
        description: "Kesiapan penuh santri untuk melanjutkan ke Tadarus Mushaf Al-Qur'an Besar 30 Juz dengan bekal tajwid praktis yang kokoh.",
        pageRange: "Hal. 29 - 32",
      },
    ],
    ebtaTarget: "Lulus Ujian Kenaikan / Khatam Metode Iqro' AMM Yogyakarta (Halaman 32): Berhak mendapatkan Sertifikat Khatam Iqro' dan melanjutkan ke Tadarus Mushaf Al-Qur'an 30 Juz.",
  },
};

/**
 * Helper to generate default aspects for a specific Jilid
 */
export function getDefaultAspectsForJilid(jilid: IqroJilid, baseScore: number = 85): IqroMaterialAspect[] {
  const meta = IQRO_AMM_JILID_DATA[jilid] || IQRO_AMM_JILID_DATA[1];
  return meta.coreMaterials.map((mat) => ({
    key: mat.key,
    name: mat.name,
    score: baseScore,
    predicate: getPredicate(baseScore),
    criteria: mat.criteria,
  }));
}

/**
 * Generate full history / progress records for Jilid 1 to 6
 */
export function generateDefaultJilidHistory(
  currentJilid: IqroJilid = 6,
  currentStatus: IqroStatus = 'Sedang Ditempuh',
  currentScore: number = 88,
  currentHalaman: number = 15
): Record<IqroJilid, { jilid: IqroJilid; status: IqroStatus; score: number; predicate: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul'; completedHalaman: number; notes: string }> {
  const history: Record<IqroJilid, any> = {} as any;
  const jilids: IqroJilid[] = [1, 2, 3, 4, 5, 6];

  jilids.forEach((j) => {
    if (j < currentJilid) {
      // Completed earlier jilids
      const sc = Math.min(95, 86 + (j * 2));
      history[j] = {
        jilid: j,
        status: 'Lulus (Naik Jilid)',
        score: sc,
        predicate: getPredicate(sc),
        completedHalaman: IQRO_AMM_JILID_DATA[j].totalPages,
        notes: `Lulus EBTA ${IQRO_AMM_JILID_DATA[j].title} dengan predikat ${getPredicate(sc)}.`,
      };
    } else if (j === currentJilid) {
      // Current active jilid
      history[j] = {
        jilid: j,
        status: currentStatus,
        score: currentScore,
        predicate: getPredicate(currentScore),
        completedHalaman: currentHalaman,
        notes: currentStatus === 'Lulus (Naik Jilid)' 
          ? `Lulus EBTA ${IQRO_AMM_JILID_DATA[j].title}.`
          : `Sedang menempuh materi pokok ${IQRO_AMM_JILID_DATA[j].title} Hal. ${currentHalaman}.`,
      };
    } else {
      // Not yet reached
      history[j] = {
        jilid: j,
        status: 'Sedang Ditempuh',
        score: 0,
        predicate: 'Maqbul',
        completedHalaman: 0,
        notes: `Target kurikulum lanjutan ${IQRO_AMM_JILID_DATA[j].title}.`,
      };
    }
  });

  return history;
}

/**
 * Calculate average score and overall predicate from an array of aspects
 */
export function calculateIqroAverage(aspects: IqroMaterialAspect[]): {
  averageScore: number;
  overallPredicate: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul';
} {
  if (!aspects || aspects.length === 0) {
    return { averageScore: 80, overallPredicate: 'Jayyid Jiddan' };
  }
  const total = aspects.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
  const avg = Math.round(total / aspects.length);
  return {
    averageScore: avg,
    overallPredicate: getPredicate(avg),
  };
}

/**
 * Create a full default TahsinGrade for a given jilid
 */
export function createDefaultTahsinGrade(
  jilid: IqroJilid = 6,
  halaman: number = 15,
  status: IqroStatus = 'Sedang Ditempuh',
  baseScore: number = 88,
  notes: string = ''
): TahsinGrade {
  const aspects = getDefaultAspectsForJilid(jilid, baseScore);
  const { averageScore, overallPredicate } = calculateIqroAverage(aspects);
  const meta = IQRO_AMM_JILID_DATA[jilid] || IQRO_AMM_JILID_DATA[6];
  const jilidHistory = generateDefaultJilidHistory(jilid, status, averageScore, halaman);

  return {
    jilid,
    halaman,
    jilidStatus: status,
    aspects,
    averageScore,
    overallPredicate,
    levelBook: `${meta.title} (Hal. ${halaman}) - AMM Yogyakarta`,
    notes: notes || `Santri sedang menempuh ${meta.title} materi ${meta.subtitle}.`,
    lastUpdated: new Date().toISOString().split('T')[0],
    jilidHistory,
    // Backward compatibility mappings
    makharijulHuruf: aspects[0]?.score || baseScore,
    ahkamutTajwid: aspects[1]?.score || baseScore,
    ahkamulWaqf: aspects[2]?.score || baseScore,
    fashahahTartil: aspects[3]?.score || aspects[0]?.score || baseScore,
  };
}
