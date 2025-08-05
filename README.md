# Sistem Tournament UNO

Aplikasi tournament UNO dengan sistem perhitungan skor yang komprehensif dan penanganan situasi seri.

## Sistem Perhitungan Skor

### Formula Dasar Poin

Poin yang didapat setiap pemain dalam satu babak:

```
Poin = Jumlah Pemain - Ranking
```

**Contoh dengan 5 pemain:**

- Juara 1: 5 - 1 = 4 poin
- Juara 2: 5 - 2 = 3 poin
- Juara 3: 5 - 3 = 2 poin
- Posisi 4: 5 - 4 = 1 poin
- Posisi 5: 5 - 5 = 0 poin

### Sistem Ranking

Ranking ditentukan berdasarkan 3 kriteria berurutan:

1. **Total Skor** (prioritas utama)
2. **Weighted Score** (jika total skor sama)
3. **Rata-rata Posisi** (jika weighted score sama)

#### Weighted Score

Sistem pemberian bobot berdasarkan posisi finishing:

```
Weighted Score = Σ (jumlah_finish_posisi × bobot_posisi)
Bobot posisi = Jumlah Pemain - Posisi + 1
```

**Bobot untuk 5 pemain:**

- Posisi 1: bobot 5
- Posisi 2: bobot 4
- Posisi 3: bobot 3
- Posisi 4: bobot 2
- Posisi 5: bobot 1

#### Rata-rata Posisi

```
Rata-rata Posisi = Total posisi semua game / Total game dimainkan
```

_Semakin kecil rata-rata posisi, semakin baik ranking_

## Contoh Perhitungan dengan 5 Pemain

### Skenario Tournament 4 Babak

**Hasil per Babak:**

| Babak | Pemain A  | Pemain B  | Pemain C  | Pemain D  | Pemain E  |
| ----- | --------- | --------- | --------- | --------- | --------- |
| 1     | Pos 1 (4) | Pos 3 (2) | Pos 2 (3) | Pos 5 (0) | Pos 4 (1) |
| 2     | Pos 2 (3) | Pos 1 (4) | Pos 4 (1) | Pos 3 (2) | Pos 5 (0) |
| 3     | Pos 1 (4) | Pos 2 (3) | Pos 5 (0) | Pos 4 (1) | Pos 3 (2) |
| 4     | Pos 3 (2) | Pos 1 (4) | Pos 2 (3) | Pos 5 (0) | Pos 4 (1) |

### Hasil Akhir

| Pemain | Total Skor | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Weighted Score | Rata² Posisi |
| ------ | ---------- | ----- | ----- | ----- | ----- | ----- | -------------- | ------------ |
| A      | 13         | 2     | 1     | 1     | 0     | 0     | 17             | 1.75         |
| B      | 13         | 2     | 1     | 1     | 0     | 0     | 17             | 1.75         |
| C      | 7          | 0     | 2     | 0     | 1     | 1     | 9              | 2.75         |
| D      | 3          | 0     | 0     | 1     | 1     | 2     | 5              | 4.25         |
| E      | 4          | 0     | 0     | 1     | 2     | 1     | 6              | 3.75         |

**Ranking Akhir:**

1. **Pemain A & B (Seri)** - Total skor sama (13), weighted score sama (17), rata-rata posisi sama (1.75)
2. **Pemain C** - Total skor 7
3. **Pemain E** - Total skor 4
4. **Pemain D** - Total skor 3

### Contoh Seri Lainnya

**Skenario Seri pada Weighted Score:**

| Pemain | Total Skor | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Weighted Score | Rata² Posisi |
| ------ | ---------- | ----- | ----- | ----- | ----- | ----- | -------------- | ------------ |
| X      | 10         | 1     | 2     | 0     | 1     | 0     | 15             | 2.0          |
| Y      | 10         | 2     | 0     | 2     | 0     | 0     | 16             | 2.0          |

**Hasil:** Pemain Y menang karena weighted score lebih tinggi (16 > 15)

**Skenario Seri pada Rata-rata Posisi:**

| Pemain | Total Skor | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Weighted Score | Rata² Posisi |
| ------ | ---------- | ----- | ----- | ----- | ----- | ----- | -------------- | ------------ |
| X      | 8          | 1     | 1     | 0     | 2     | 0     | 12             | 2.5          |
| Y      | 8          | 1     | 1     | 2     | 0     | 0     | 12             | 2.25         |

**Hasil:** Pemain Y menang karena rata-rata posisi lebih baik (2.25 < 2.5)

## Fitur Aplikasi

### Setup Tournament

- Tentukan jumlah pemain (minimum 2)
- Masukkan nama pemain
- Pilih jumlah babak atau unlimited

### Gameplay

- Input ranking pemain setiap babak
- Sistem otomatis menghitung poin
- Update leaderboard real-time
- Tracking statistik per pemain

### Statistik & Export

- Papan skor dengan handling seri
- Statistik detail setiap pemain
- Riwayat semua babak
- Export ke PDF

### Penanganan Seri

- Indikator visual untuk seri sempurna
- Grouping pemain yang seri dengan tanda "&"
- Ranking posisi yang akurat

## Teknologi

- **Framework:** Next.js
- **Language:** JavaScript
- **Styling:** CSS Modules
- **Storage:** LocalStorage
- **Export:** PDF generation

---

_Tournament UNO - Sistem perhitungan yang adil dan transparan untuk semua pemain_
