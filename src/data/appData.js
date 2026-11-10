export const COUNTRIES = ["ОАЭ", "Турция", "Таиланд", "Египет", "Мальдивы", "Вьетнам", "Бали"];
export const CITIES = {
  "ОАЭ": ["Дубай", "Абу-Даби"],
  "Турция": ["Анталья", "Белек", "Стамбул"],
  "Таиланд": ["Пхукет", "Самуи"],
  "Египет": ["Шарм-эль-Шейх", "Хургада"],
  "Мальдивы": ["Мале", "Атолл Баа", "Южный Ари Атолл"],
  "Вьетнам": ["Нячанг", "Фукуок"],
  "Бали": ["Убуд", "Нуса Дуа"]
};
export const MEAL_TYPES = [
  "Ultra All Inclusive",
  "All Inclusive",
  "Full Board",
  "Half Board",
  "BB (Завтраки)",
  "Питание по выбранному тарифу",
  "Ultra All-Inclusive по тарифу",
  "Platinum Plan доступен по тарифу"
];

const commonsPhoto = (url, filename, credit, license, alt) => {
  const licenseMatch = license.match(/^CC BY(-SA)? (\d+(?:\.\d+)?)/);
  return {
    url,
    alt,
    credit,
    license,
    licenseUrl: licenseMatch
      ? `https://creativecommons.org/licenses/by${(licenseMatch[1] || '').toLowerCase()}/${licenseMatch[2]}/`
      : "https://commons.wikimedia.org/wiki/Commons:Licensing",
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename).replace(/%20/g, '_')}`
  };
};

const REAL_HOTELS_DB = [
  {
    country: "ОАЭ",
    city: "Дубай",
    name: "Atlantis, The Palm",
    officialUrl: "https://www.atlantis.com/dubai/atlantis-the-palm",
    desc: "Курорт Atlantis, The Palm расположен на Palm Jumeirah. В комплексе находятся аквапарк Aquaventure World, аквариум The Lost Chambers и частный пляж.",
    locationDescription: "Palm Jumeirah, Дубай. Курортный комплекс с частным пляжем и бассейнами.",
    amenities: ["Аквапарк Aquaventure World", "Аквариум The Lost Chambers", "Частный пляж", "Бассейны"],
    roomTypes: ["Номера и люксы; конкретная категория зависит от тарифа"],
    dining: "На территории работают рестораны и кафе. Включённое питание зависит от выбранного тарифа.",
    stars: 5,
    price: 1200000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Без питания", "Завтрак", "Полупансион"],
    beach: "Частный пляж",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Atlantis%2C_The_Palm_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa_in_Dubai_2.jpg/1280px-Atlantis%2C_The_Palm_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa_in_Dubai_2.jpg", "Atlantis, The Palm from Le Royal Méridien Beach Resort and Spa in Dubai 2.jpg", "CT Cooper", "Public domain", "Atlantis, The Palm, вид с побережья"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Atlantis%2C_The_Palm_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa_in_Dubai_3.jpg/1280px-Atlantis%2C_The_Palm_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa_in_Dubai_3.jpg", "Atlantis, The Palm from Le Royal Méridien Beach Resort and Spa in Dubai 3.jpg", "CT Cooper", "Public domain", "Atlantis, The Palm, панорамный вид")
    ]
  },
  {
    country: "ОАЭ",
    city: "Абу-Даби",
    name: "Emirates Palace Mandarin Oriental",
    officialUrl: "https://www.mandarinoriental.com/en/abu-dhabi/emirates-palace",
    desc: "Курорт Emirates Palace Mandarin Oriental расположен на западном побережье Корниш в Абу-Даби. Отель известен частным пляжем и ресторанами международной кухни.",
    locationDescription: "Район Рас-эль-Ахдар, Абу-Даби; отель выходит на частный пляж длиной около 1,3 км.",
    amenities: ["Частный пляж", "Спа и бассейны", "Рестораны на территории"],
    roomTypes: ["Номера и люксы; наличие и условия зависят от даты"],
    dining: "На территории есть, среди прочего, Hakkasan, Talea, Lebanese Terrace и Martabaan. Питание в стоимость входит только при соответствующем тарифе.",
    stars: 5,
    price: 1500000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Без питания", "Завтрак", "Полупансион"],
    beach: "Частный песчаный пляж",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Emirates_Palace_-_55482143859.jpg/1280px-Emirates_Palace_-_55482143859.jpg", "Emirates Palace - 55482143859.jpg", "xiquinhosilva", "CC BY 4.0", "Emirates Palace, внешний вид"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Emirates_palace-abu_dhabi-2011_%285%29.JPG/1280px-Emirates_palace-abu_dhabi-2011_%285%29.JPG", "Emirates palace-abu dhabi-2011 (5).JPG", "Alberto-g-rovi", "CC BY-SA 3.0", "Emirates Palace, фасад"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Emirates_palace-abu_dhabi-2011_%286%29.JPG/1280px-Emirates_palace-abu_dhabi-2011_%286%29.JPG", "Emirates palace-abu dhabi-2011 (6).JPG", "Alberto-g-rovi", "CC BY-SA 3.0", "Emirates Palace, территория")
    ]
  },
  {
    country: "Турция",
    city: "Белек",
    name: "Maxx Royal Belek Golf Resort",
    officialUrl: "https://www.maxxroyal.com/maxx-royal-belek",
    desc: "Пятизвёздочный курорт Maxx Royal в Белеке на побережье Средиземного моря. Варианты размещения включают люксы и виллы; среди особенностей — гольф и сервис Maxx Assistant.",
    locationDescription: "Белек, провинция Анталья, Турция. Курорт у Средиземного моря.",
    amenities: ["Пляж и бассейны", "Гольф-клуб Colin Montgomerie", "Детская зона Maxxi Land", "Сервис Maxx Assistant"],
    roomTypes: ["Люксы", "Lagoon Suites", "Виллы"],
    dining: "В отеле есть рестораны и бары. Концепция Ultra All-Inclusive относится к конкретному тарифу и должна быть подтверждена при бронировании.",
    stars: 5,
    price: 1800000,
    meal: "Ultra All-Inclusive по тарифу",
    mealPlans: ["Питание по тарифу отеля"],
    beach: "Средиземноморское побережье",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/MAXX_ROYAL_BELEK_5%282015%29_-_panoramio.jpg/1280px-MAXX_ROYAL_BELEK_5%282015%29_-_panoramio.jpg", "MAXX ROYAL BELEK 5(2015) - panoramio.jpg", "edykbo", "CC BY 3.0", "Maxx Royal Belek, внешний вид"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/MAXX_ROYAL_BELEK_5%282015%29_-_panoramio_%2811%29.jpg/1280px-MAXX_ROYAL_BELEK_5%282015%29_-_panoramio_%2811%29.jpg", "MAXX ROYAL BELEK 5(2015) - panoramio (11).jpg", "edykbo", "CC BY 3.0", "Maxx Royal Belek, территория"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/MAXX_ROYAL_BELEK_5%282015%29_-_panoramio_%2813%29.jpg/1280px-MAXX_ROYAL_BELEK_5%282015%29_-_panoramio_%2813%29.jpg", "MAXX ROYAL BELEK 5(2015) - panoramio (13).jpg", "edykbo", "CC BY 3.0", "Maxx Royal Belek, вид на курорт")
    ]
  },
  {
    country: "Турция",
    city: "Белек",
    name: "Rixos Premium Belek",
    officialUrl: "https://www.rixos.com/hotel-resort/rixos-premium-belek",
    desc: "Курорт Rixos Premium Belek находится в Белеке на средиземноморском побережье Турции. Название и фотографии относятся именно к отелю в Белеке, а не к отдельному отелю в центре Антальи.",
    locationDescription: "Белек, район Серик, провинция Анталья, Турция.",
    amenities: ["Курортная территория", "Бассейны и зоны отдыха", "Рестораны на территории"],
    roomTypes: ["Номера и люксы; категорию и наличие нужно проверить на выбранные даты"],
    dining: "Состав питания и включённые рестораны зависят от тарифа и даты проживания.",
    stars: 5,
    price: 1400000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Питание по тарифу отеля"],
    beach: "Побережье Средиземного моря",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/RIXOS_PREMIUM_BELEK_5_%282015%29_-_panoramio.jpg/1280px-RIXOS_PREMIUM_BELEK_5_%282015%29_-_panoramio.jpg", "RIXOS PREMIUM BELEK 5 (2015) - panoramio.jpg", "edykbo", "CC BY 3.0", "Rixos Premium Belek, внешний вид"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/RIXOS_PREMIUM_BELEK_5_%282015%29_-_panoramio_%281%29.jpg/1280px-RIXOS_PREMIUM_BELEK_5_%282015%29_-_panoramio_%281%29.jpg", "RIXOS PREMIUM BELEK 5 (2015) - panoramio (1).jpg", "edykbo", "CC BY 3.0", "Rixos Premium Belek, территория"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/RIXOS_PREMIUM_BELEK_5_%282015%29_-_panoramio_%282%29.jpg/1280px-RIXOS_PREMIUM_BELEK_5_%282015%29_-_panoramio_%282%29.jpg", "RIXOS PREMIUM BELEK 5 (2015) - panoramio (2).jpg", "edykbo", "CC BY 3.0", "Rixos Premium Belek, вид на курорт")
    ]
  },
  {
    country: "Таиланд",
    city: "Пхукет",
    name: "Katathani Phuket Beach Resort",
    officialUrl: "https://www.katathani.com/",
    desc: "Пляжный курорт на пляже Ката-Ной на Пхукете. По информации отеля, территория расположена вдоль примерно 850-метрового участка пляжа; в комплексе есть отдельные корпуса для размещения.",
    locationDescription: "Пляж Ката-Ной, Пхукет, Таиланд. Отель находится у моря.",
    amenities: ["Пляж Ката-Ной", "Спа-услуги", "Несколько корпусов", "Рестораны и зоны отдыха"],
    roomTypes: ["Номера в корпусах Thani Wing и Bhuri Wing; точный тип зависит от тарифа"],
    dining: "На территории доступны рестораны. Завтрак и другие приёмы пищи включаются только в отдельных тарифах.",
    stars: 5,
    price: 1100000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Без питания", "Завтрак", "Полупансион"],
    beach: "Пляж Ката-Ной",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Good_maintained_beautiful_courtyard_of_Katathani_Beach_Resort_Phuket_-_panoramio.jpg/1280px-Good_maintained_beautiful_courtyard_of_Katathani_Beach_Resort_Phuket_-_panoramio.jpg", "Good maintained beautiful courtyard of Katathani Beach Resort Phuket - panoramio.jpg", "yuichiro anazawa", "CC BY 3.0", "Katathani Phuket Beach Resort, территория"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Katathani_Phuket_Beach_Resort_-_panoramio.jpg/1280px-Katathani_Phuket_Beach_Resort_-_panoramio.jpg", "Katathani Phuket Beach Resort - panoramio.jpg", "yuichiro anazawa", "CC BY 3.0", "Katathani Phuket Beach Resort, здание курорта"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Katathani_Phuket_Beach_Resort_-_panoramio_%281%29.jpg/1280px-Katathani_Phuket_Beach_Resort_-_panoramio_%281%29.jpg", "Katathani Phuket Beach Resort - panoramio (1).jpg", "yuichiro anazawa", "CC BY 3.0", "Katathani Phuket Beach Resort, вид на отель")
    ]
  },
  {
    country: "Египет",
    city: "Шарм-эль-Шейх",
    name: "Sultan Gardens Resort",
    officialUrl: "https://www.sultangardens.com/",
    desc: "Курорт Sultan Gardens Resort расположен в Шарм-эш-Шейхе. На фотографиях показана территория именно этого отеля; конкретные услуги и состав питания следует проверять по тарифу.",
    locationDescription: "Шарм-эш-Шейх, Египет, на побережье Красного моря.",
    amenities: ["Бассейны и открытые зоны отдыха", "Пляжная зона", "Рестораны на территории"],
    roomTypes: ["Номера и семейные варианты; конкретную категорию проверяйте по датам"],
    dining: "Доступны рестораны отеля. Включённость питания и напитков определяется условиями выбранного пакета.",
    stars: 5,
    price: 850000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Питание по тарифу отеля"],
    beach: "Побережье Красного моря",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Sharm_el_Sheikh%2C_Sultan_Gardens_Resort_-_panoramio_%2810%29.jpg/1280px-Sharm_el_Sheikh%2C_Sultan_Gardens_Resort_-_panoramio_%2810%29.jpg", "Sharm el Sheikh, Sultan Gardens Resort - panoramio (10).jpg", "Tanya Dedyukhina", "CC BY 3.0", "Sultan Gardens Resort, территория"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Sharm_el_Sheikh%2C_Sultan_Gardens_Resort_-_panoramio_%2812%29.jpg/1280px-Sharm_el_Sheikh%2C_Sultan_Gardens_Resort_-_panoramio_%2812%29.jpg", "Sharm el Sheikh, Sultan Gardens Resort - panoramio (12).jpg", "Tanya Dedyukhina", "CC BY 3.0", "Sultan Gardens Resort, здания"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Sharm_el_Sheikh%2C_Sultan_Gardens_Resort_-_panoramio_%2813%29.jpg/1280px-Sharm_el_Sheikh%2C_Sultan_Gardens_Resort_-_panoramio_%2813%29.jpg", "Sharm el Sheikh, Sultan Gardens Resort - panoramio (13).jpg", "Tanya Dedyukhina", "CC BY 3.0", "Sultan Gardens Resort, общий вид")
    ]
  },
  {
    country: "Мальдивы",
    city: "Южный Ари Атолл",
    name: "Lily Beach Resort & Spa",
    officialUrl: "https://www.lilybeachmaldives.com/",
    desc: "Курорт на острове Хувахенду в Южном Ари Атолле. В официальном каталоге размещения перечислены пляжные виллы, виллы у лагуны и водные виллы; у некоторых категорий есть собственный бассейн или выход к лагуне.",
    locationDescription: "Остров Хувахенду, Южный Ари Атолл, Мальдивы. Трансфер до острова зависит от пакета и расписания.",
    amenities: ["Пляжные и водные виллы", "Прямой доступ к лагуне у отдельных категорий", "Спа и водные активности"],
    roomTypes: ["Beach Villa", "Lagoon Villa", "Deluxe Water Villa", "Beach Residence with Pool"],
    dining: "На официальном сайте описан пакет Platinum Plan. Проверьте перечень включённых блюд, напитков и активностей в актуальных условиях тарифа.",
    stars: 5,
    price: 3500000,
    meal: "Platinum Plan доступен по тарифу",
    mealPlans: ["Platinum Plan — проверить состав тарифа"],
    beach: "Островные пляжи и лагуна",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Lily_Beach_Island_Resort_Hotel_%E8%8D%94%E8%8D%94%E5%B3%B6%E7%81%98%E5%BA%A6%E5%81%87%E6%9D%91_-_panoramio.jpg/1280px-Lily_Beach_Island_Resort_Hotel_%E8%8D%94%E8%8D%94%E5%B3%B6%E7%81%98%E5%BA%A6%E5%81%87%E6%9D%91_-_panoramio.jpg", "Lily Beach Island Resort Hotel 荔荔島灘度假村 - panoramio.jpg", "lienyuan lee", "CC BY 3.0", "Lily Beach Resort, вид на остров"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Lily_Beach_Island_Resort_Hotel_%E9%BA%97%E5%8A%9B%E6%B5%B7%E5%B3%B6%E6%B8%A1%E5%81%87%E6%9D%91_-_panoramio.jpg/1280px-Lily_Beach_Island_Resort_Hotel_%E9%BA%97%E5%8A%9B%E6%B5%B7%E5%B3%B6%E6%B8%A1%E5%81%87%E6%9D%91_-_panoramio.jpg", "Lily Beach Island Resort Hotel 麗力海島渡假村 - panoramio.jpg", "lienyuan lee", "CC BY 3.0", "Lily Beach Resort, виллы у воды"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Lily_Beach_Island_Resort_Hotel_%E9%BA%97%E9%BA%97%E6%B5%B7%E7%81%98%E6%B8%A1%E5%81%87%E6%9D%91_-_panoramio.jpg/1280px-Lily_Beach_Island_Resort_Hotel_%E9%BA%97%E9%BA%97%E6%B5%B7%E7%81%98%E6%B8%A1%E5%81%87%E6%9D%91_-_panoramio.jpg", "Lily Beach Island Resort Hotel 麗麗海灘渡假村 - panoramio.jpg", "lienyuan lee", "CC BY 3.0", "Lily Beach Resort, береговая линия")
    ]
  },
  {
    country: "Мальдивы",
    city: "Атолл Баа",
    name: "Soneva Fushi",
    officialUrl: "https://soneva.com/resorts/soneva-fushi/",
    desc: "Островной курорт Soneva Fushi в атолле Баа: виллы среди зелени и над водой, природные активности, оздоровительные процедуры и рестораны с разными форматами.",
    locationDescription: "Остров Кунфунаду, атолл Баа, Мальдивы.",
    amenities: ["Островные и водные виллы", "Природные активности", "Спа и оздоровительные занятия", "Детский клуб The Den"],
    roomTypes: ["Виллы среди зелени", "Виллы над водой"],
    dining: "Официальный сайт сообщает о более чем двенадцати вариантах питания и круглосуточных treat rooms. Включённость конкретных блюд зависит от тарифа.",
    stars: 5,
    price: 3500000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Питание по тарифу отеля"],
    beach: "Островные пляжи",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Soneva_Fushi_-_panoramio.jpg/1280px-Soneva_Fushi_-_panoramio.jpg", "Soneva Fushi - panoramio.jpg", "Ameer Dawood", "CC BY 3.0", "Soneva Fushi, вид на остров"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Soneva_Fushi_-_panoramio_%281%29.jpg/1280px-Soneva_Fushi_-_panoramio_%281%29.jpg", "Soneva Fushi - panoramio (1).jpg", "Ameer Dawood", "CC BY 3.0", "Soneva Fushi, остров и берег")
    ]
  },
  {
    country: "Вьетнам",
    city: "Фукуок",
    name: "JW Marriott Phu Quoc Emerald Bay Resort & Spa",
    officialUrl: "https://www.marriott.com/en-us/hotels/pqcjw-jw-marriott-phu-quoc-emerald-bay-resort-and-spa/overview/",
    desc: "Курорт JW Marriott на пляже Кхем (Бай-Кем) острова Фукуок. Архитектурная концепция оформлена как вымышленный университет; фотографии показывают бассейн Shell Pool и ресторан Pink Pearl.",
    locationDescription: "Пляж Кхем, остров Фукуок, Вьетнам.",
    amenities: ["Пляж Кхем", "Бассейн Shell Pool", "Спа и рестораны"],
    roomTypes: ["Номера, люксы и виллы; условия зависят от категории и даты"],
    dining: "На территории есть рестораны, в том числе Pink Pearl. Включённое питание зависит от тарифа.",
    stars: 5,
    price: 1050000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Без питания", "Завтрак", "Полупансион"],
    beach: "Пляж Кхем (Бай-Кем)",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/JW_Marriott_Shell_Pool_Phu_Quoc.jpg/1280px-JW_Marriott_Shell_Pool_Phu_Quoc.jpg", "JW Marriott Shell Pool Phu Quoc.jpg", "Vivu Vietnam", "CC BY-SA 4.0", "JW Marriott Phu Quoc, Shell Pool"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Jw-marriott-phu-quoc-bai-kem.jpg/1280px-Jw-marriott-phu-quoc-bai-kem.jpg", "Jw-marriott-phu-quoc-bai-kem.jpg", "Vivu Vietnam", "CC BY-SA 4.0", "JW Marriott Phu Quoc у пляжа Бай-Кем"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Nha-hang-pink-pearl.jpg/1280px-Nha-hang-pink-pearl.jpg", "Nha-hang-pink-pearl.jpg", "Vivu Vietnam", "CC BY-SA 4.0", "Ресторан Pink Pearl в JW Marriott Phu Quoc")
    ]
  },
  {
    country: "Бали",
    city: "Нуса Дуа",
    name: "Mulia Resort Bali",
    officialUrl: "https://www.themulia.com/bali",
    desc: "Mulia Resort — один из трёх отдельных форматов размещения в комплексе Mulia Bali. Курорт расположен у пляжа Гегер в Нуса-Дуа; не следует путать его с отдельными объектами The Mulia и Mulia Villas.",
    locationDescription: "Нуса-Дуа, Бали, на побережье пляжа Гегер.",
    amenities: ["Пляж Гегер", "Бассейны", "Рестораны и зоны отдыха"],
    roomTypes: ["Категории номеров и условия уточняются по выбранным датам"],
    dining: "В комплексе есть несколько ресторанов и форматов питания. Конкретный план питания проверяется по тарифу.",
    stars: 5,
    price: 1400000,
    meal: "Питание по выбранному тарифу",
    mealPlans: ["Без питания", "Завтрак", "Полупансион"],
    beach: "Пляж Гегер",
    photos: [
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Mulia_Resort_-_Bali_%2852784714273%29.jpg/1280px-Mulia_Resort_-_Bali_%2852784714273%29.jpg", "Mulia Resort - Bali (52784714273).jpg", "Thank You (25 Millions ) views from Fresno, USA", "CC BY 2.0", "Mulia Resort Bali, вид на курорт"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Mulia_Resort_Bali_%2852339372366%29.jpg/1280px-Mulia_Resort_Bali_%2852339372366%29.jpg", "Mulia Resort Bali (52339372366).jpg", "Thank You (25 Millions ) views from Fresno, USA", "CC BY 2.0", "Mulia Resort Bali, территория"),
      commonsPhoto("https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Mulia_Resort_Bali_%2852396394700%29.jpg/1280px-Mulia_Resort_Bali_%2852396394700%29.jpg", "Mulia Resort Bali (52396394700).jpg", "Thank You (25 Millions ) views from Fresno, USA", "CC BY 2.0", "Mulia Resort Bali, архитектура")
    ]
  }
];

export const generateHotels = () => {
  return REAL_HOTELS_DB.map((hotel, index) => ({
    ...hotel,
    id: `h-${index + 1}`,
    image: hotel.photos[0].url,
    description: hotel.desc,
    rating: null,
    reviews: [],
    viewers: null,
    roomsLeft: null
  }));
};

// --- MOCK CRM USERS ---
export const INITIAL_USERS = [
  { id: 'u-1', name: 'Арман Смагулов', phone: '+7 777 123 45 67', ltv: 1500000, status: 'Platinum', isBanned: false },
  { id: 'u-2', name: 'Дильназ Каримова', phone: '+7 701 555 33 22', ltv: 450000, status: 'Gold', isBanned: false },
  { id: 'u-admin', name: 'Super Admin', phone: '-', ltv: 0, status: 'Staff', isBanned: false }
];
