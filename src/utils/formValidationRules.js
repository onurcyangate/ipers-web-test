export const requiredRule = [
  value => {
    if (value !== null && value !== '') {
      return true
    }

    return 'Bu alan gereklidir.'
  }
]

export const emailRules = [
  value => {
    if (value == null || value === '') return true
    if (/.+@.+\..+/.test(value)) return true

    return 'Lütfen geçerli bir e-posta adresi giriniz.'
  },
]

export const eitherFieldRule = (field1, field2, fieldName1 = "e-posta", fieldName2 = "telefon") => {
  const isField1Filled = !!field1;
  const isField2Filled = !!field2;

  if (!(isField1Filled || isField2Filled)) {
    return `Lütfen ${fieldName1} ve ${fieldName2} girin.`;
  }

  return true;
};

export const max512Char = [
  value => {
    if (value.length <= 512) return true;

    return 'Maksimum karakter sayısı 512 olmalı.';
  }
];

export const maxFileSize10MiB = [
  value => {
    if (value[0].size <= 10485760) return true;

    return 'Maksimum dosya boyutu 10MB olmalı.';
  }
];

export const minMaxValue = (min, max) => [
  value => {
    if (value <= max && value > min) return true;

    return `Sayı {min} ve {max} arasında olmalı.`.replace('{max}', max).replace('{min}', min);
  }
];

