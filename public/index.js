/*
	Комментарии отражают ход мыслей или поясняют,
	чтобы было понятно почему сделал именно так, а не по другому.
*/

//Каждая переменна с новой строки, а не var a, b; для читаемости
//При обращении к jQuery коллекциям, проверка на наличие производится через length, т.к. пустая коллекция это объект и приравнивается к true
// Констркуции типа - значение && (выражение1 || выражение2) и прочие, просто замена if.
/*
	Было написано, чтобы новинки сортировались еще и по дате, а т.к. в дополнительнх заданиях было указано,
	реализовать фильтрацию по цене и дате, я подумал, что для всех, так и сделал.
*/
/*
	Пи нажати на быстрый просмотр открывается карточка товара.
	Реализовано, как отдельный блок, т.к. нет сервера
*/
/*
	При использовании фильтров, неподходящим элементам присваевается display = none,
	Пересоздавать дольше. Но реализовать это не сложнее, очистить контейнер,
	применить фильтрацию к объетам (каждый отображаемый товар связан со воим объектом) и создать
*/

/*
	Долго делал навигационную панель, были разные идеи, что-то додумывалось во время написания
	или вскрывалось при тестировании.
	Вина в недостаточно потраченном времени напроектирвоание
*/

(function(){//оборачиваю в вызов на месте, чтобы не засорять window.
var log = console.log;
/*
	Получаю необходимые элементы, которые понадобятся для работы, чтобы потом не тратить ресурсы на посик, а обращаться по ссылке
	Предпочитаю все переменные выносить выше, но некоторые элементы создаются динамически и их еще нет на момент начала исполнения
*/
var body = $("body");
var page = body.find("#page");
var search_field = body.find("#search_field");
var button_search = body.find("#button_search");
var sort_options = body.find("#sort_options");
var content_block = body.find("#content");
var products_container = content_block.find("#products_container");

var sort_result = content_block.find("#sort_result");
var search_result = sort_result.find("#search_result");
var filters = sort_result.find("#filters");

//Для работы с блоком оповещения
var warn_block = body.find("#warn_block");
var warn_head =  body.find("#warn_head");
var warn_body =  body.find("#warn_body");
var warn_ok = warn_block.find("#warn_ok");

var toast_product = body.find("#toast_product");

var card_product = body.find("#card_product");

var buton_close = $(".close_elem");

var navigation = body.find("#navigation");
var navigation_wrap = navigation.find(".wrap");

var link_left = navigation_wrap.find(".link_left").prop("num", 1).hide();
var link_right = navigation_wrap.find(".link_right").hide();
var spread_left = navigation_wrap.find(".spread_left").hide();
var spread_right = navigation_wrap.find(".spread_right").hide();


var exp_key = [35, 36, 38, 47, 60, 62, 64, 92, 94]; //#35,$36,&38/47<60>62@64\92^94 коммент для соответсвия символам
var regexp_key=/[#$&/<>@\^]/;

var store_data = {}//Пригодится для быстрого обращения к данным
var select_block = "women";//Мужские или женские товары открыты

var warn_timer = null;
var toast_timer = null;

var prices = {
	"min": 100,
	"max": 30000,
	"sort_min": 100,
	"sort_max": 30000,
};

var sort_values = {//Чтобы потом не искать в коде и вручную исправлять
	"name": "name",
	"price_min": "price_min_max",
	"price_max": "price_max_min",
	"date_min": "date_min_max",
	"date_max": "date_max_min",
}

var search_text = "";
var count_products = 0;

var v_link = 2;
/*
	Видимые ссылки за раз, не выставлять <4,
	когда элементов меньше, чем на 3 ссылки, они уложатся в 2 или 3 сами?
	а если больше - работает не так как нужно, если скрывать лишние.
	По этому в функции перепроверяется.
*/
var min_count = 9; //Количество товаров на странце

store_data["prices"]=prices;

/*
Сделал не так, потому что проще где нужно записывать в store_data, чем либо обращаться к цепочке объектов, или прописывать переменные
var store_data = {
	prices: {
		"min": 100,
		"max": 30000,
		"sort_min": 100,
		"sort_max": 30000,
	},
}
*/

var filtering_products = [];
var pages_count=0;

var templates = {//Быстрее создать один раз, а потом клонировать, для инкапсуляции не прописал их в html
	"div": $("<div>"),
	"img": $("<img>"),
	"span": $("<span>"),
	"a": $("<a>"),
	"action_template": $(".actions_product.hide_elem"),
	"h6": $("<h6>"),
	"form": $("<form>"),
	"ul": $("<ul>"),
	"li": $("<li>"),
	"checkbox": $("<div class='checkbox_elem'><span></span></div>"),
	"label": $("<label>"),
	"input_check": $("<input type='checkbox_elem'/>"), 
};

//Доступные локали
var locals = {
	1: "ru",
	2: "uk",
	3: "usa",
}

//Данные для локалей, сделал только русскую
var currency = {
	"ru": "руб",
}

var current_locale=locals[1];//Текущая локаль

var prefix="./public/images/products/";//Префикс для путей фото

var links = {//ссылки на изображения для динамически создаваемых изображений
	"default": "default.jpg",
	1: "nike_air.jpg",
	2: "nike_training_free_TR.jpg",
	3: "shirt_Nike.jpg",
	4: "nike_air_force_1_upstep.jpg",
	5: "nike_running_dri_fit_power_essential.jpg",
	6: "nike_pre_montreal_premium_leather_trainers_in_pink.jpg",
	7: "nike_air_force_1_ultraforce.jpg",
	8: "nike_short.jpg",
	9: "nike_tk.jpg",
	10: "nike_internationalist.jpg",
};

for(let key in links) {
	links[key]=prefix+links[key];
}

/*
	огород с объектами для настроек локали, на будущее,
	делаю с учетом что все на клиенте, если бы грузилось с сервера, этого бы не понадобилось 
*/
var product_settings = {//Натсройки
	/*
		Тестовое задание, но делаю с заделом и исходя из того, что все на клиенте.
		ru - для русской локали, uk - для англоязычной value - поле, которое не меняется невзависимо от языка

		Использовал числовые ключи, но нужно было идентифицировать объект, сделал ключ = value
	*/
	"categories": {
		"women": {
			"default" : {"ru": "", "uk": "", "value": "default"},
			"cloth": {"ru": "Одежда", "uk": "clothes", "value": "cloth"}, // 1
			"s_a_a": {"ru": "Обувь и аксессуары", "uk": "shoes_and_accessories", "value": "s_a_a"}, // 2
			s_a_a: {"ru": "Косметика", "uk": "cosmetics", "value": "cosm"}, // 3
			"J_a_c": {"ru": "Украшения и часы", "uk": "jewelery and watches", "value": "s_a_a"}, // 4
			J_a_c: {"ru": "Джемперы и кардиганы", "uk": "jumpers_and_cardigans", "value": "J_a_c"}, // 5
			"overalls": {"ru": "Комбинезоны", "uk": "overalls", "value": "overalls"}, // 6
			"u_a_n": {"ru": "Нижнее и ночное белье", "uk": "underwear_and_nightwear", "value": "u_a_n"}, // 7
			"c_c": {"ru": "Одежда в стиле casual", "uk": "casual_clothes", "value": "c_c"}, // 8
			"f_e_m": {"ru": "Для будущих мам", "uk": "for_expectant_mothers", "value": "f_e_m"}, // 9
			//"f_m_g": {"ru": "Для миниатюрных девушек", "uk": "for_miniature_girls", "value": "f_m_g"}, // 10
			"s_a_b": {"ru": "Рубашки и блузки", "uk": "shirts_and_blouses", "value": "s_a_b"}, // 11
			"foot": {"ru": "Обувь", "uk": "footwear", "value": "foot"}, // 12
			"short": {"ru": "Шорты", "uk": "shorts", "value": "short"}, // 13
			"skir": {"ru": "Юбки", "uk": "skirts", "value": "skir"}, // 14
			"s_s_a_t": {"ru": "Носки, чулки и колготки", "uk": "socks_stockings_and_tights", "value": "s_s_a_t"}, // 15
			"sungl": {"ru": "Солнцезащитные очки", "uk": "sunglasses", "value": "sungl"}, // 16
			"beach": {"ru": "Пляжная одежда", "uk": "beachwear", "value": "beach"}, // 17
			"s_a_s": {"ru": "Футболки и майки", "uk": "shirts and shirts", "value": "s_a_s"}, // 18
			"f_h": {"ru": "Для высоких", "uk": "for high", "value": "f_h"}, // 19
			"top": {"ru": "Топы", "uk": "tops", "value": "top"}, // 20
			"t_a_l": {"ru": "Брюки и леггинсы", "uk": "trousers and leggings", "value": "t_a_l"}, // 21
			"s_f_o": {"ru": "Костюмы для офиса", "uk": "suits for office", "value": "s_f_o"}, // 22
			//23: {"ru": "", "uk": ""}"sets - DISCOUNT", // Комплекты - СКИДКА
		},
		"men": {
			"default" : {"ru": "", "uk": "", "value": "default"},
			"b_s": {"ru": "большой размер", "uk": "big size", "value": "b_s"}, // 1
			"p_s": {"ru": "футболки-поло", "uk": "Polo shirts", "value": "p_s"}, // 2
			"shirt": {"ru": "рубашки", "uk": "Shirts", "value": "shirt"}, // 3
			"s_b_a_s": {"ru": "туфли, ботинки и кеды", "uk": "Shoes, boots and sneakers", "value": "s_b_a_s"}, // 4
			"short": {"ru": "шорты", "uk": "shorts", "value": "short"}, // 5
			"cost": {"ru": "костюмы", "uk": "costumes", "value": "cost"}, // 6
			"sungl": {"ru": "солнцезащитные очки", "uk": "sunglasses", "value": "sungl"}, // 7
			"breach": {"ru": "пляжная одежда", "uk": "beachwear", "value": "breach"},// 8
			"f_h": {"ru": "для высоких", "uk": "for high", "value": "f_h"}, // 9
			"p_a_c": {"ru": "брюки и чиносы", "uk": "Pants and chinos", "value": "p_a_c"}, // 10 
			"t_shirt": {"ru": "футболки и майки", "uk": "T-shirts and T-shirts", "value": "t_shirt"}, // 11
			"u_a_s": {"ru": "нижнее белье и носки", "uk": "Underwear and socks", "value": "u_a_s"}, // 12
			"cl": {"ru": "часы", "uk": "clock", "value": "cl"}, // 13
		},
	},
	"colors": {
		"default" : {"ru": "", "uk": "", "value": "default"},
		"be": {"ru": "Бежевый", "uk": "beige", "value": "be"}, // 1
		"wh": {"ru": "Белый", "uk": "white", "value": "wh"}, // 2
		"yell": {"ru": "Желтый", "uk": "yellow", "value": "yell"}, // 3
		"green": {"ru": "Зеленый", "uk": "green", "value": "green"}, // 4
		"gold": {"ru": "Золотой", "uk": "gold", "value": "gold"}, // 5
		"red": {"ru": "Красный", "uk": "red", "value": "red"}, // 6
		"cr": {"ru": "Кремовый", "uk": "cream", "value": "cr"}, // 7
		"copp": {"ru": "Медный ", "uk": "copper", "value": "copp"}, // 8
		"mult": {"ru": "Мульти ", "uk": "multi", "value": "mult"}, // 9
		"or": {"ru": "Оранжевый ", "uk": "orange", "value": "or"}, // 10
		"pi": {"ru": "Розовый ", "uk": "pink", "value": "pi"}, // 11
		"sil": {"ru": "Серебряный ", "uk": "silver", "value": "sil"}, // 12
		"gray": {"ru": "Серый ", "uk": "gray", "value": "gray"}, // 13
		"bl": {"ru": "Синий ", "uk": "blue", "value": "bl"}, // 14
		"d_bl": {"ru": "Темно-синий ", "uk": "dark_blue", "value": "d_bl"}, // 15
		"purp": {"ru": "Фиолетовый ", "uk": "purple", "value": "purp"}, // 16
		"bl": {"ru": "Черный ", "uk": "black", "value": "bl"}, // 17
	},
	"sizes": {
		"default" : {"ru": "", "uk": "", "value": "default"},
		"eu35.5": {"all": "EU 35.5", "value": "eu35.5"},
		"eu36": {"all": "EU 36", "value": "eu36"},
		"eu36.5": {"all": "EU 36.5", "value": "eu36.5"},
		"eu37": {"all": "EU 37", "value": "eu37"},
		"eu37.5": {"all": "EU 37.5", "value": "eu37.5"},
		"eu38": {"all": "EU 38", "value": "eu38"},
		"eu38.5": {"all": "EU 38.5", "value": "eu38.5"},
		"eu39": {"all": "EU 39", "value": "eu39"},
		"eu39.5": {"all": "EU 39.5", "value": "eu39.5"},
		"eu40": {"all": "EU 40", "value": "eu40"},
		"eu40.5": {"all": "EU 40.5", "value": "eu40.5"},
		"eu41": {"all": "EU 41", "value": "eu41"},
		"eu41.5": {"all": "EU 41.5", "value": "eu41.5"},
		"eu42": {"all": "EU 42", "value": "eu42"},
		"eu42.5": {"all": "EU 42.5", "value": "eu42.5"},
		"xs": {"all": "XS", "value": "xs"},
		"s": {"all": "S", "value": "s"},
		"m": {"all": "M", "value": "m"},
		"l": {"all": "L", "value": "l"},
		"xl": {"all": "XL", "value": "xl"},
	},
	"styles": {
		"default" : {"ru": "", "uk": "", "value": "default"},
		"cas": {"uk": "casual", "ru":"Casual", "value": "cas"},
		"sv": {"uk": "svitshoty", "ru":"Cвитшоты", "value": "sv"},
		"h_a": {"uk": "hair accessories", "ru":"Аксессуары для волос", "value": "h_a"},
		"a_f_t": {"uk": "accessories for technology", "ru":"Аксессуары для техники", "value": "a_f_t"},
		"bik": {"uk": "bikini", "ru":"Бикини", "value": "bik"},
		"bom": {"uk": "bombers", "ru":"Бомберы", "value": "bom"},
		"t_r_b": {"uk": "trousers-riding breeches", "ru":"Брюки-галифе", "value": "t_r_b"},
		"bras": {"uk": "brassieres", "ru":"Бюстгальтеры", "value": "bras"},
		"wind": {"uk": "windbreaker", "ru":"Ветровки", "value": "wind"},
		"wais": {"uk": "waistcoats", "ru":"Жилеты", "value": "wais"},
		"card": {"uk": "cardigans", "ru":"Кардиганы", "value": "card"},
		"caps": {"uk": "caps", "ru":"Кепки", "value": "caps"},
		"s_top": {"uk": "short Tops", "ru":"Короткие топы", "value": "s_top"},
		"sneak": {"uk": "sneakers", "ru":"Кроссовки", "value": "sneak"},
		"swim": {"uk": "swimsuits", "ru":"Купальники", "value": "swim"},
		"legg": {"uk": "leggings", "ru":"Леггинсы", "value": "legg"},
		"long": {"uk": "the Longsleeves", "ru":"Лонгсливы", "value": "long"},
		"shir": {"uk": "shirts", "ru": "Майки", "value": "shir"},
		"s_as": {"uk": "socks and socks", "ru": "Носки и гольфы", "value": "s_as"},
		"park": {"uk": "parks", "ru": "Парки", "value": "park"},
		"d_j": {"uk": "dresses-jumper", "ru": "Платья-джемперы", "value": "d_j"},
		"d_t_s": {"uk": "dresses-T-shirts", "ru": "Платья-футболки", "value": "d_t_s"},
		"d_j": {"uk": "down jacket", "ru": "Пуховик", "value": "d_j"},
		"back": {"uk": "backpacks", "ru": "Рюкзаки", "value": "back"},
		"s_f_s": {"uk": "sandals on a flat sole", "ru": "Сандалии на плоской подошве", "value": "s_f_s"},
		"sp_pant": {"uk": "sport pants", "ru": "Спортивные брюки", "value": "sp_pant"},
		"w_b_b": {"uk": "bags", "ru":"Сумки", "value": "bag"},
		"t_skirt": {"uk": "waist Bag Bags", "ru":"Сумки-кошельки на пояс", "value": "w_b_b"},
		"und": {"uk": "bags-Shopper", "ru":"Сумки-шоппер", "value": "b_shop"},
		"tshir": {"uk": "trapezoidal skirts", "ru":"Трапециевидные юбки", "value": "t_skirt"},
		"und": {"uk": "underpants", "ru":"Трусы", "value": "und"},
		"tshir": {"uk": "T-shirts", "ru":"Футболки", "value": "tshir"},
		"hood": {"uk": "hoodie", "ru":"Худи", "value": "hood"},
		"o_p_d": {"uk": "one piece dresses", "ru":"Цельнокройные платья", "value": "o_p_d"},
		"cas_p_t": {"uk": "cases for phones and tablets", "ru":"Чехлы для телефонов и планшетов", "value": "cas_p_t"},
		"cap_bin": {"uk": "cap-bini", "ru":"Шапки-бини", "value": "cap_bin"},
		"slip": {"uk": "slippers", "ru": "Шлепанцы", "value": "slip"},
		"short_cas_s": {"uk": "shorts in casual style", "ru": "Шорты в стиле casual", "value": "short_cas_s"},
		"sk_sh": {"uk": "skirt shorts", "ru": "Юбка-шорты", "value": "sk_sh"},
		"sk_pen": {"uk": "skirts-pencils", "ru": "Юбки-карандаши", "value": "sk_pen"},
	},
	"collections": {
		"default" : {"ru": "", "uk": "", "value": "default"},
		"new_seas": {"uk": "new season", "ru": "Новый сезон", "value": "new_seas"},
		"sale": {"uk": "sale", "ru": "Распродажа", "value": "sale"},
	},
	"details": {
		"default" : {"ru": "", "uk": "", "value": "default"},
		"str0": {"value": "str0"},
	}
};

var strings = {
	"str0": "Очень детальное описание товара, расчитанное на несколько строк, так как выдумывать очень много чего будет пустой тратой времени", 
}


var products = {//Хранилище товаров
	"women": {},//думал массив, но лучше объет, чтобы при удалении не думать о смещени индексов
	"men": {},
}

var p_women = products["women"];//Переменные для более быстрого обращения
var p_men = products["men"];

addProperty([p_women, p_men], {
	/*Добавляю свойства, в функции подробнее описано,
	не использую prototype, потому что это свойство должно быть только у этих 2 объектов*/
	name: "addProduct",
	value: addProduct,
	writable: false,
	configurable: false,
	enumerable: false,
});

//--------------------------Основной код
var c_w = product_settings["categories"]["women"];
var womens_products=[//Создаю товары для отображения
/*
	Получилась большая мешанина с цепочками обращения,
	в угоду большей чистоте компонента

	Создаю вручну, а не генерирую, для большей гибкости в тестировании
*/
	new Product({
		"link": links[1],
		"name": "Розовые кроссовки Nike Air Huarache Run Premium",
		"categories": c_w["foot"]["value"],
		"prices": 8076.90,
		"colors": product_settings["colors"]["pi"]["value"],
		"sizes": product_settings["sizes"]["eu35.5"]["value"],
		"styles": product_settings["styles"]["sneak"]["value"],
		"age": "old",
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[2],
		"name": "Кроссовки Nike Training Free TR Focus Flyknit",
		"categories": c_w["foot"]["value"],
		"prices": 8846.13,
		"colors": product_settings["colors"]["bl"]["value"],
		"sizes": product_settings["sizes"]["eu36"]["value"],
		"styles": product_settings["styles"]["sneak"]["value"],
		"age": "old",
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[3],
		"name": "Футболка с логотипом в полоску Nike",
		"categories": c_w["s_a_s"]["value"],
		"prices": 2307.69,
		"colors": product_settings["colors"]["bl"]["value"],
		"sizes": product_settings["sizes"]["xs"]["value"],
		"styles": product_settings["styles"]["shir"]["value"],
		"collections": product_settings["collections"]["sale"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[4],
		"name": "Светло-коричневые высокие замшевые кроссовки-премиум Nike Air Force 1 Upstep",
		"categories": c_w["foot"]["value"],
		"prices": 7307.68,
		"colors": product_settings["colors"]["be"]["value"],
		"sizes": product_settings["sizes"]["eu39"]["value"],
		//Стиля нет
		"collections": product_settings["collections"]["new_seas"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[5],
		"name": "Леггинсы Nike Running Dri-Fit Power Essential",
		"categories": c_w["t_a_l"]["value"],
		"prices": 2538.46,
		"colors": product_settings["colors"]["bl"]["value"],
		"sizes": product_settings["sizes"]["eu37"]["value"],
		"styles": product_settings["styles"]["legg"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[6],
		"name": "Nike Pre Montreal Premium Leather Trainers In Pink",
		"categories": c_w["foot"]["value"],
		"prices": 5384.60,
		"colors": product_settings["colors"]["pi"]["value"],
		"sizes": product_settings["sizes"]["eu37"]["value"],
		"styles": product_settings["styles"]["sneak"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[7],
		"name": "Черные кроссовки средней высоты Nike Air Force 1 Ultraforce",
		"categories": c_w["foot"]["value"],
		"prices": 8351.10,
		"colors": product_settings["colors"]["bl"]["value"],
		"sizes": product_settings["sizes"]["eu37"]["value"],
		"styles": product_settings["styles"]["sneak"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[8],
		"name": "Коралловые шорты в винтажном стиле Nike",
		"categories": c_w["short"]["value"],
		"prices": 1923.07,
		"colors": product_settings["colors"]["pi"]["value"],
		"sizes": product_settings["sizes"]["s"]["value"],
		"styles": product_settings["styles"]["short_cas_s"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[9],
		"name": "Серые спортивные штаны Nike Tk",
		"categories": c_w["t_a_l"]["value"],
		"prices": 9000,
		"colors": product_settings["colors"]["gray"]["value"],
		"sizes": product_settings["sizes"]["xs"]["value"],
		//"styles": product_settings["styles"]["short"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
	new Product({
		"link": links[10],
		"name": "Серые кроссовки Nike Internationalist",
		"categories": c_w["foot"]["value"],
		"prices": 5153.83,
		"colors": product_settings["colors"]["gray"]["value"],
		"sizes": product_settings["sizes"]["xl"]["value"],
		"styles": product_settings["styles"]["sneak"]["value"],
		"details": product_settings["details"]["str0"]["value"],
	}),
];



// Для мужчин не стал делать




p_women.addProduct(womens_products);//Добавляю масив в соответствующую секцию

//---------------------------

function Product(opt={}) {//Один товар
	var opt_default = {//натройки по умолчанию
		"link": links["default"],//Ссылка на изображение
		"name": "none", //Название
		"categories": "default",//Категория
		"prices": "default",//Цена - не 0, бесплатно (вдруг) = 0
		"colors": "default", //Цвет нужен обязательно, но нужно инициализировать
		"sizes": "default", //0 размер для детей
		"styles": "default", //Мжет не быть подходящего стиля
		"collections": "default", //Может быть вне коллекции
		"age": "young",//Новый или старый (не стал использовать слово new) young || old
		"details": "Описание",
	};

	this.identifier = (Math.random().toFixed(5)+"").slice(2);

	for(let key in opt_default) {
		opt[key] = opt[key] || opt_default[key];//Задаю насройки из opt, либо из по умолчанию
	}
	
	/*"category", // категория
	"prices", // цена
	"colour", // цвет
	"size", // размер
	"style", // стиль
	"collection", // коллекция*/

	this.setOptions = (newOpt)=>{//Задавать новые опции
		var type=null;
		var value = null;
		for(let key in newOpt) {
			opt[key]=newOpt[key];
		}
	}

	this.getOptions=(flag)=>{//Получить текущие опции
		return (flag) ? opt : Object.assign({}, opt); // получить копию или сам объект с опциями, в зависимости от флага
	}
}


createSortList({
	"container_id": "sort_categories",
	"header_text": "Категория",
	"type": "list",
	"data": product_settings["categories"]["women"],
	"clear_text": "Очистить",
	"value_type": "categories",
}, sort_options);

createSortList({
	"container_id": "sort_price",
	"header_text": "Цена",
	"type": "range-double",
	"value_type": "prices",
	"clear_text": "Очистить",
	"slider_trace": true,
}, sort_options);

createSortList({
	"container_id": "sort_color",
	"header_text": "Цвет",
	"type": "list",
	"value_type": "colors",
	"clear_text": "Очистить",
	"data": product_settings["colors"],
}, sort_options);

createSortList({
	"container_id": "sort_size",
	"header_text": "Размер",
	"type": "list",
	"value_type": "sizes",
	"clear_text": "Очистить",
	"data": product_settings["sizes"],
}, sort_options);

createSortList({
	"container_id": "styles",
	"header_text": "Стиль",
	"type": "list",
	"value_type": "styles",
	"clear_text": "Очистить",
	"data": product_settings["styles"],
}, sort_options);

createSortList({
	"container_id": "sort_collection",
	"header_text": "Коллекция",
	"type": "list",
	"value_type": "collections",
	"clear_text": "Очистить",
	"data": product_settings["collections"],
}, sort_options);

initPage();

function initPage() {
	createProductsDOM(womens_products, products_container);
	createPageNavigation();
	showSelectProducts(1, pages_count, filtering_products);
}

//--------------Обработчики-----------

/*
Получение DOM элементов быстрее по производительности делать вне функций, тем более обработчиков
*/
/*
Так как обработчикам нужны определенные элементы, но часть из них создается динамически.
И чтобы ускорить работу пришлось вынести переменные вне функций.
*/
//find быстрее $(), т.к. сужается поиск

var sort_lists = sort_options.find(".sort_list");
var sort_price = sort_options.find("#sort_price");
var slider_price_track = sort_price.find(".track_elem");
var slider_price_min = sort_price.find(".range_min");
var slider_price_max = sort_price.find(".range_max");
var min_price = sort_price.find(".values_container .min");
var max_price = sort_price.find(".values_container .max");

var trace_left = sort_price.find(".trace_left");
var trace_right = sort_price.find(".trace_right");

insertText(min_price, prices["sort_min"]+currency[current_locale]);
insertText(max_price, prices["sort_max"]+currency[current_locale]);

var slide_price_container = slider_price_min.parent();

var track_width = slider_price_track.width();
var segment_weight = calculationSegment(prices["min"], prices["max"], track_width);

var slide_min_width = slider_price_min.width();
var slide_max_width = slider_price_max.width(); // размеры одинаковы, это на случай разных размеров

var collection_checkbox = sort_options.find(".checkbox_elem");

var bord_slide_price={//Границы для движения ползунков с учетом друг друга
	"range_min": {
		"left": 0,
		"right": calcOffset(slider_price_max, slide_price_container).left-slide_max_width,
	},
	"range_max": {
		"left": calcOffset(slider_price_min, slide_price_container).left+slide_min_width,
		"right": slide_price_container.width()-slide_max_width,
	},
}//Совпадение с именем класса, для удобства


var min_class="range_min";
var max_class="range_max";
//Прописываю имена классов, которые должны быть у одного из элементов, чтобы если что менять значение в одном месте, а не искать строки в коде

/*
	Не ищу разницу между положением max и min, потому что:

	Если расчитывать отностительно границ родительского элемента,
	то нужно будет 2 раза вызывать calculation_segment - в итоге 4 вызова offset (внутри функции 2 штуки)
	Если расчитывать относительно друг друга, то 2 + узнать смещение левого = 4.
	Нет разницы, но вариант со смещением относительно родителя проще в понимании. 
*/

//body.mousedown(function(e){e.preventDefault();});

//navigator.userAgent
sort_price.add("a").mousedown(function(e){
	e.preventDefault();
});



/*
	В JS есть событие input и onchange, в jQuery только change
*/

search_field[0].addEventListener("input", function(e) {
	/*
		Если убрать код ниже, то будет искать тоько по нажатию на enter,
		или по нажатию на кнопку с лупой

		сли повесить setTimeout и при каждом нажатии очищать таймер и ставить снова,
		то тогда посик будет начинаться только после окончания ввода
	*/
	var value = this.value.trim();
	if(!value.length) {
		
		search_text="";
		resetOptions(sort_lists);
		filteringProducts("women");

	} else if(regexp_key.test(value) || !validation(value)) {
		/*
			В обработчике ниже отлавливаются "запрещенные" символы,
			но их можно вставить копипастой
		*/
		$(this).addClass("danger");
	} else {
		$(this).removeClass("danger");
		search_text=value;
		resetOptions(sort_lists);
		filteringProducts("women");
	}
});


search_field.keypress(function(e) {

	if(exp_key.includes(e.keyCode)) {
		/*
			Мне нужно только отменить действие по умолчанию, т.е. e.preventDefault();
			Предотвращать всплытие или перехват мне не нужно, но так как здесь его нет,
			то можно просто вернуть false, что эквивалентно двум этим событиям.
			Даже если вешать горячие клавиши для какого-либо родительскоо элемента, то это может оказатся полезным
		*/
		return false;		
	}//showWarning({"body": "Введены некоректные символы",});
});

filters.change(function(e) {
	products_container.append(sortingResult($(".product")));
});

/*
Старая версия, поиск по enter

search_field.keypress(function(e) {

	if(exp_key.includes(e.keyCode)) {
		
		return false;		
	} else if(e.keyCode == 13 && validation(this.value)) {
		  search_text=this.value || "";
		  resetOptions(sort_lists);
		  filteringProducts("women");
	} else if(e.keyCode == 13) {
		showWarning({"body": "Введены некоректные символы",});
	}
});

*/


body.on("click", function(e) {
	//Делегирвание - много обработчиков больше нагрузки
	var target = $(e.target);

	var sort_header = target.closest(".sort_name", sort_lists);
	var clear = target.closest(".clear_elem", sort_lists);
	var checbox = target.closest(".checkbox_elem", sort_lists);
	var _warn_ok = target.closest(warn_ok);
	var _button_search = target.closest(button_search);
	var buton_close = target.closest(".close_elem", ".data_container");
	var view_product = target.closest(".view_product", ".actions_product");
	var save_product = target.closest(".save_product", ".actions_product");
	var link = target.closest(".link_elem", navigation);
	/*
		Если блок видимый и нажатие не на нем, то скрыть
	*/
	card_product.is(":visible") && !target.closest(card_product).length && card_product.hide();
	

	if(sort_header.length) {
		sort_header.toggleClass("close_elem")
		.closest(".sort_list")
		.find(".sort_content")
		.toggleClass("hide_elem");

	} else if (clear.length) {

		var parent = clear.closest(".sort_list");
		resetOptions(parent);
		filteringProducts("women");

	} else if(checbox.length) {
		//При выборе хотябы одного фильтара - появляется очистить
		
		checbox.toggleClass("active_elem");
		filteringProducts("women");

		var count_active = checbox.closest(".sort_list").find(".checkbox_elem.active_elem").length;

		if(!count_active) return;
		checbox.closest(".sort_list")
		.find(".clear_elem")
		.css("display", "block");

	} else if(_warn_ok.length) {

		warn_timer && (clearTimeout(warn_timer) || (warn_timer=null));//Если таймеру присвое timeout, то очищаю
		hideWarn();
	
	} else if(_button_search.length) {

		var value = search_field.val();
		if(!validation(value)) {
			showWarning({"body": "Введены некоректные символы",});
			return;
		}
		search_text=value || "";
		resetOptions(sort_lists);
		filteringProducts("women");
	} else if(buton_close.length) {
		buton_close.closest(".data_container").hide();

	} else if(view_product.length) {
		var identifier = view_product.closest(".product").prop("identifier");
		var product_object = products[select_block][identifier];	
		var options = product_object.getOptions();

		showProductCard(options, card_product);

	} else if(save_product.length) {
		var parent_product = save_product.closest(".product");
		var identifier = parent_product.prop("identifier");

		var product_object = products[select_block][identifier];	
		var options = product_object.getOptions();

		var page_offset = page.offset(); 
		var offset = save_product.offset();

		showProductToast(
			Object.assign(
				{
					"offset_left": offset.left-page_offset.left-parent_product.width()/1.5,
					"offset_top": offset.top-page_offset.top-parent_product.height()/1.5
				}, options),
			toast_product
		);
		
		toast_timer = setTimeout(()=>{toast_product.hide(150)}, 500);

		toast_product.on("mouseenter.toast", function(e) {
				//Если мышь вернулась на элемент сбросить таймер
				clearTimeout(toast_timer);
				toast_timer=null;
		})
		.on("mouseleave.toast", function(e) {
			//Если мышь ушла с элемента скрыть элемент и снять обработчики
			var el = $(this);
			toast_timer = setTimeout(()=>{
				el.hide(150, function() {
					el.off("mouseenter.toast mouseleave.toast");
				})
			}, 500);
		});

	} else if(link.length) {
		var all_links = navigation.find(".link_elem");
		var links = all_links.not(".link_left,.link_right,.spread_left,.spread_right");
		var left_num = link_left.prop("num");
		var right_num = link_right.prop("num");
		var num = link.prop("num");

		if (link.hasClass("active")) {
			return;
		} else if(right_num<=v_link || !v_link || all_links.length<7) {
			/*
				Если отображаются все, то логика проста
			*/

			all_links.filter(".active").removeClass("active");
			link.addClass("active");
	
		} else {

			clickPageNavigation(num, links);

		}
		showSelectProducts(navigation.find(".active").prop("num"), right_num, filtering_products);
		//Не стал логику отрисовки помещать в clickPageNavigation, т.к. эта функция просто отрисовывает навигацию.
		document.body.scrollTop=0;//Не стал использоват jQuery, т.к. нужно просто прокрутить страницу вверх.
	}
})
.on("mousedown.range", ".slider_elem", function(e) {
	/*
		Когда происходит нажатие мыши ны ползунке, вешается обработчик на body,
		потому что если вешать на ползунок, то если мышь двигается слишком быстро, то
		курсор может уйти с ползунка и возникнут ненужные последствия
	*/
	
	var slider=$(e.target);
	var slider_width = slider.width();
	var half_width = slider_width/2;
	var price_elem=null;
	var slider_container = slider.parent();//Нужно получить родителя, т.к. положение ползунка будет меняться
	
//Обращение к переменной быстрее, чем к цепочке объектов

	var slider_class=null;
	var one_slider_bord=null;
	var two_slider_bord=null;
	var current_trace = null;
	var current_bord = null;

	if(slider.hasClass(min_class)) {
		slider_class=min_class;
		one_slider_bord = bord_slide_price[min_class];
		two_slider_bord = bord_slide_price[max_class];
		price_elem = min_price;

		current_trace = trace_left;
		current_bord=one_slider_bord["left"];
	} else {
		slider_class=max_class;
		one_slider_bord = bord_slide_price[max_class];
		two_slider_bord = bord_slide_price[min_class];
		price_elem = max_price;

		current_trace = trace_right;
		current_bord = track_width;
	}
	var left_bord=one_slider_bord["left"];
	var right_bord=one_slider_bord["right"];
	
	var price_sort = (slider_class == min_class) ? "sort_min" : "sort_max";

	var left = slider_container.offset().left+half_width;//Получаю смещение относительно документа + половина ширины ползунка
	var x = e.pageX-left;//координаты внутри контейнера = координаты мыши - координаты элемента

	body.on("mousemove.range", function(e) {//движение на body
		x = e.pageX-left;
		x = (x<left_bord) ? left_bord : ((x>right_bord) ? right_bord : x);//Лаконичнее else if
		var current_price = prices[price_sort] = (Math.floor(x*segment_weight))+prices["min"];//Записываю выбранные рамки

		current_trace.width(Math.abs(x-current_bord));

		slider.css("left", x+"px");

		insertText(price_elem, parseCurrency(current_price, currency[current_locale]));

		$(this).on("mouseup.range", function(e) {//при отпускании клавиши, ненужные обработчки движения и отпускания снимаются
			
			switch(slider_class) {//Перебор быстрее, чем перезаписывать границы для обаих ползунков
				case min_class://Вот и переменные вместо строк пригодились
					//Если ползунок минимального значения, то меняя допустимую левую границу у максимального
					bord_slide_price[max_class]["left"]=x+slider_width;
					break;
				case max_class:
					//И наоборот
					bord_slide_price[min_class]["right"]=x-slider_width;
					break;
			}

			filteringProducts("women");

			var clear = slider.closest(".sort_list").find(".clear_elem");

			if((prices["max"] == prices["sort_max"]) && (prices["min"] == prices["sort_min"])) {
				clear.css("display", "none");
			} else {
				clear.css("display", "block");
			}


			$(this).off("mousemove.range")
			.off("mouseup.range");
		});
	});
});

//------------------------------------

//--------------Вспомогтельные функции---------

function filteringProducts(gender_key) {
	//При фильтрации не стал очищать и пересоздавать DOM, что дороже, а просто меняю display
	var active_checkbox = collection_checkbox.filter(".active_elem");
	active_checkbox = (active_checkbox.length) ? active_checkbox : collection_checkbox;
	var visible_products = $(".product").css("display", "none");
	
	/*
		Думал отсортировать только видимые,
		но лучше сортировать все доступные
	*/
	visible_products = sortingResult(visible_products);


	var conformity = {};//color: [red, blue], например
	let temp=null;

	for(let i = 0; i<active_checkbox.length; i++) {//Записываю данные из выбранных checkbox
		temp = active_checkbox.eq(i).closest("li");
		let value_type = temp.prop("value_type");
		if(!conformity[value_type]) conformity[value_type] = [];
		conformity[value_type].push(temp.prop("val"));
	}

	var result=[];//Массив идентификаторов
	/*
	var result={
		"men": [],
		"women": [],
	};
	*/

	let products_select = null;
	let current_product = null;
	let arr = null;
	let options = null;
	
	/*
		Для оперирования всеми продуктами или определенным, если передан его ключ
	*/
	var _products =null;

	if(gender_key) {
		_products = {};
		_products[gender_key] = products[gender_key];
	} else {
		_products = products;
	}

	for(let gender in _products) {

		//products["men"] || products["women"]
		//arr = result[gender];

		products_select = _products[gender];//беру массив объектов для мужчин или женщин

		m:
		for(let key in products_select) {
			current_product = products_select[key];//Получаю 1 объект
			
			/*
			Проверяю данные у объекта продукта и если он подходит, то взаимодействую с DOM,
			т.к. операции с объектами js быстрее, чем с DOM
			*/
			options = current_product.getOptions();
			
			for(let filed in options) {

				//color, например

				if(!conformity[filed] || options[filed]=="default") continue;

				var _price = (options["prices"] < prices["sort_min"]) || (options["prices"] > prices["sort_max"]);

				if(!isSearch(options["name"], search_text) || _price || !conformity[filed].includes(options[filed])) continue m;

				/*
					Прохожусь по опциям, проверяю, есть ли в соответсвующем массиве допустимых значений
					значение такого параметра у элемента.
					Если хоть одно не совпадает - объект пропускается
				*/
			}
			
			result.push(current_product["identifier"]);
			/*
				Два массива быстрее с использованием includes, вместо общиего for
				обавляю в массив, потом отсортирую
			*/
			//У объекта value_type соответсвует свойству value_type
		}
	}

	//Взяты только те элементы, которые подходят
	filtering_products = [];//Резултаты фильтра запоминаются для последующей навигации
	if(result.length) {
		visible_products.each(function(i, item) {
			if(result.includes(this.identifier)) {

				this.style.display="block";
				filtering_products.push(this);
			}
		});
		showSelectProducts(1, pages_count, filtering_products);
	}
	createPageNavigation(filtering_products);
	showResultSearch({"count": filtering_products.length});
	
	function isSearch(str1, str2) {//В str1 ищется str2
		str2=str2.trim();
		if(!str2.length) return true;//Если пустая строка поиска, то значит ничего конкретноо не ищется

		/*
			Строку с поисковым значением разбиваю в массив,
			Обхожу циклом, проверяя, есть ли слово в str1,
			Если хоть одного нет, то прекращаю выполнение
		*/
		str1=str1.trim().toLowerCase();
		str2 = str2.toLowerCase().split(" ");

		var result = true;
		for(let i = 0; i<str2.length; i++) {//Не стал использовать forEach, из-за отсутствия break
			if(!result) return false;
			result=str1.includes(str2[i]);
		}
		return result;
	}
}

function sortingResult(array_elems) {
	
	var value = null;
	var direction = "max";
	switch(filters.val()) {
		case sort_values["name"]:
			value="name";
			direction="min";
			break;

		case sort_values["price_min"]:
			direction="min";

		case sort_values["price_max"]:
			value="prices";
			break;
		case sort_values["date_min"]:
			direction="min";

		case sort_values["date_max"]:
			value="date";
			break;
	}
	/*
		Если по min, то схема сравнивания одинаковая, value разные
	*/
	return array_elems.sort((a, b)=>{
			a=$(a);
			b=$(b);
			return ((direction=="max") ? a.prop(value)<b.prop(value) : a.prop(value)>b.prop(value));
		})

}

function showResultSearch(opt) {
	search_result.find(".badge").text(opt["count"]);
}

function showWarning(textObj) {
	warn_block.show();
	warn_block.show(100, function() {
		warn_timer = setTimeout(()=>{hideWarn()}, 4000);
	});
	warn_head.text((textObj["head"] || "Предупреждение"));
	warn_body.text(textObj["body"] || "");
	warn_ok.show().text(textObj["button"] || "Ок");
}

function hideWarn() {
	warn_block.hide();
	warn_ok.hide();
}

function showProductCard(data, elem) {
	showInfoBlock(data, elem);
}

function showProductToast(data, elem) {
	var offset_top = data["offset_top"];
	var offset_left = data["offset_left"];
	elem.css({"top": offset_top, "left": offset_left});
	log(elem[0]);
	showInfoBlock(data, elem);
}

function showInfoBlock(data, elem) {
	/*
		Вручную самый быстрый вариант и в данном случае очевидный.
		Объеснение на примере ps["categories"][data["category"]], что происходит.
		Берутся данные из data - это ключ объекта и его value и в product_settings ищется соответствующий объект
	*/
	var name = elem.find(".name");
	var image = elem.find(".image");
	var price = elem.find(".price");
	var text = elem.find(".text");
	var category = elem.find(".category");
	var color = elem.find(".color");
	var size = elem.find(".size");
	var style = elem.find(".style");
	var collections = elem.find(".collections");

	var curr = currency[current_locale];

	var _prices = parseCurrency(data["prices"], curr);
	var _category = product_settings.categories;
	_category = _category[select_block];
	_category = _category[data.categories];
	_category = _category[current_locale];

	var _colors = product_settings.colors[data.colors][current_locale];
	var _sizes = product_settings.sizes[data.sizes]["all"];
	var _styles = product_settings.styles[data.styles][current_locale];
	var _colls = product_settings.collections[data.collections][current_locale];

	var key = current_locale;
	var ps = product_settings;

	name.text(data["name"]);
	(image.length) && image.attr("src", data["link"]);

	price.text(data["prices"]+" "+curr);
	text.text(strings[data["details"]]);
	category.text(_category);
	color.text(_colors);
	size.text(_sizes);
	style.text(_styles);
	collections.text(_colls);
	elem.show();
}

function validation(str) {
	return !/[<\>/#@$^&]/.test(str);
}

function insertText(elem, text) {
	elem=$(elem);
	elem.text(text);
}

function calculationSegment(min, max, length) {
	return ((max-min)/length);
	//расчитываю цена к пикселю

}

function addProduct(product) {//для будущего удаляния элемента и он вычищения
	//Либо ключ - значение, либо массив в тесте не нужно, но на будущее для большей гибкости
	var parent = this;
	var key = null;
	switch(Object.prototype.toString.call(product)) {
		case "[object Array]":
			for(let i = 0; i<product.length; i++) {
				key = product[i]["identifier"];
				help(product[i], key);
			}
			break;
		default:
			key = product["identifier"];
			help(product, key);
			break;
	}
	/*
		Хотел массив, но с рандомными индексами не нужно думать о смещении индексов при удалени
		индекс в массиве сместится, но в product останентся прежний
	*/

	/*
	Можно через рекурсию, но рекурсия дороже и здесь не такое глубокое дерево
	*/
	function help(obj, key) {
		Object.defineProperty(obj, "parentObject", {
			value: {"parent": parent, "key": key},
			writable: true,
			configurable: true,
			enumerable: false,
		});
		parent[key]=obj;
	}
}

function addProperty(objs, props) {
	
	var arr = [].concat(objs);//Если просто элемент, то все-равно создается массив, чтобы не городить разные проверки
	var arrProps = [].concat(props);

	arr.forEach((itemObj)=>{//Для 1 объекта
		arrProps.forEach((itemProp)=>{// вешаем все свойства
			Object.defineProperty(itemObj, itemProp["name"], {
				value: itemProp["value"],
				writable: itemProp["writable"],
				configurable: itemProp["configurable"],
				enumerable: itemProp["enumerable"],
			});
		}); 
	});
}

function createProductsDOM(arr, rootEl) {//По хорошему все рендерится на сервере и при надобности подгружается через ajax или websocket
	/*
	Элемент имеет такую структуру:
	{
		"link": links[3],
		"name": "Футболка с логотипом в полоску Nike",
		"category": c_w[18],
		"prices": 2307.69,
		"color": product_settings["colors"][17],
		"size": product_settings["sizes"][16],
		"style": product_settings["styles"][18],
		"collection": product_settings["collections"][2],
	},
	*/
	//Не использую add - так как возвращает новую коллекцию
	var div_t = templates["div"];
	var img_t = templates["img"];
	var span_t = templates["span"];
	var a_t = templates["a"];
	var action_template = templates["action_template"];

	var container=null;//Быстрее перезаписывать, чем циклично создавать новые
	var img_wrap = null;
	var name=null;
	var img=null;
	var span=null;
	var a = null;

	var options = null;
	var price = null;
	var create_count = 0;

	var products_created = arr.map((item)=>{
		options = item.getOptions();
		container = div_t.clone(true);
		img_wrap = div_t.clone(true)
		.addClass("img_wrap");
		
		name = a_t.clone(true)
		.text(options.name);
		
		img = img_t.clone(true)
		.attr("src", options.link);

		img_wrap.append(action_template.clone(true).removeClass("hide_elem"))
		.append(img);
		
		span = span_t.clone(true);
		price=parseCurrency(options.prices, " "+currency[current_locale]);
		span.text(price);
		/*
			Обдумывал разные варианты, но самым рациональным показался
			связывание объектов с данными, как в React.js
		*/
		container.prop({"identifier": item["identifier"],
			"name": options["name"],
			"prices": options["prices"],
			"date": options["date"] || new Date(),
		})
		.append(img_wrap)
		.addClass("product")
		.append(name)
		.append(span);
		++create_count;
		item.ref=container;
		return container;
	});
	count_products = create_count;
	showResultSearch({"count": create_count});
	rootEl.append(sortingResult(products_created));
}

function createSortList(values, rootElem) {
	/*
		Не стал прописывать в html, т.к. генерация дает больше гибкости.
	*/
	var checkbox = templates["checkbox"];
	var li = templates["li"];
	var a = templates["a"];
	var div = templates["div"];
	var span = templates["span"];
	var data = values["data"] || {};
	var callback = values["callback"];
	var value_type = values["value_type"];
	var values_container = null;

	var postfix = values["postfix"] || "";
	var text_min_value = data["min"] || "";
	var text_max_value = data["max"] || "";

	var content=div.clone().addClass("sort_content");
	var container = templates["div"].clone().addClass("sort_list").prop("value_type", value_type);
	var header = templates["h6"].clone().addClass("sort_name")
	.text(values["header_text"]);
	var clear = span.clone().addClass("clear_elem").text(values["clear_text"]);

	var elem = null;
	
	switch(values["type"]) {
		case "range":
			//createRange([min, max]); Количество элементов для 1 или 2 ползунков
			var min = span.clone()
			.addClass("values min")
			.text((text_min_value+postfix));
			
			createRange(min);
			
			break;
		case "range-double":

			var min = span.clone()
			.addClass("values min")
			.text((text_min_value+postfix));

			var max = span.clone()
			.addClass("values max")
			.text((text_max_value+postfix));

			createRange([min, max], "two");

			break;
		case "list":
		default:
			elem = templates["ul"].clone();
			var items=[];
			var item = null;
			var link = null;
			var check = null;
			var text = null;
			var data_value = null;
			var obj=null; //быстрее перезаписывать переменную, чем объялять заново в цикле

			for(let key in data) {
				if(key=="default") continue;

				//key = число, data = объект
				obj = data[key];
				data_value = obj["value"];
				
				//Проверка именно в цикле, потому что 1 элемент может быть строкой, а 2 объект и т.д.
				text = obj[current_locale] || obj["all"];

				link = a.clone()
				.text(text);
				check=checkbox.clone();
				item=li.clone()
				.append([check, link])
				.prop({"val": data_value, "value_type": value_type});
				items.push(item);
			}
			elem.append(items);
			break;
	}
	item=null;

	if(values["container_id"]) {
		container.attr("id", values["container_id"]);
	}
 	container.append([header, content, clear])
	content.append(elem);
	if(values_container) {
		content.append(values_container);
	}
	rootElem.append(container);
	
	if(callback) {
		callback();
	}

	function createRange(elems=[], type="one") {
	/*
		Можно создавать одиночный и двойной ползунок,
		одиночный не нужен в тесте, но решил сделать, чтобы функция былаболее законченной
	*/
		elems = [].concat(elems);
		elem = div.clone();

		var slide_elems=[div.clone().addClass("track_elem")];
			
		var is_trace = !!values["slider_trace"];

		switch(type) {
			case "two":

				slide_elems.push(div.clone().addClass("slider_elem range_max"));
				if(is_trace) slide_elems.push(div.clone().addClass("tracers trace_right"));
				//Без break пойдет дальше, если 2 создутся элементы выше и ниже, если 1, то только ниже
			case "one":

				slide_elems.push(range_min = div.clone().addClass("slider_elem range_min"));
				if(is_trace) slide_elems.push(div.clone().addClass("tracers trace_left"));

				break;
		}

		values_container = div.clone()
		.addClass("values_container")
		.append(elems);
			
		elem.addClass("range_container")
		.append(slide_elems);

		container.addClass("range_elem");	
	}
}

function createPageNavigation(products){
	navigation_wrap.find("link_elem:not(.link_left,.link_right,.spread_left,.spread_right)").remove();//При фильтрации нужно перерисовывать
	//Просто отрисовка
	var products = (products) ? $(products) : $(".product:visible");
	var count = products.length;
	//var v_link = 4; //Видимые ссылки
	//var min_count = 2; //Количество товаров на странце

	if(!count || min_count>=count) {
		link_left.hide();
		link_right.hide();
		return;
	}
	
	var link = null;
	var num = 0;
	var arr = [];
	var isOne = true;
	/*
		Вместо сложного описания, проще написать так, т.к. это будет всегда верно при том,
		когда максимальном числе отображаемых элементов, больше, чем половина от максимального числа
		это всегда будет истино, при
	*/
	var haf_count = count>>1;
	var three_min = min_count*3;

	link_left.show()
	.addClass("link_elem active")
	.prop("num", 1)
	.find("a")
	.text(1);
	link_right.show();

	if(min_count>=(count>>1)) {//минимальное количество отображаемых элементов >= половине всех элементов
		//сдвиг быстрее деления
		link_right.prop("num", 2).find("a").text(2);
		pages_count = 2;
		return;
	} else if((min_count < haf_count) && (three_min > haf_count) && (three_min>count)) {
		/*
			1) Если минимальное кольичество на странице меньше половины количества всех элементов
			 - то есть элементов не на 2 страницы
			2) и мин. кол-во умноженное на 3 больше половины кол-ва лементов
			- если получить сколько бы поместилось на 3 страницы и это больше половины всех элементов,
			- то на количество меньшее 3 не поместится 
			3) и мин. кол-во умноженное на 3 > всей длине
			- меньше или равно, то не перебор.		
			Для 2 к 10 - true && true && false
			Для 3 к 10 - true && true && false
			Для 4 к 10 - true && true && true 10 эл. на 3 стр.
			Большие, чем половина - обрабатываются выше
		*/
		link_right.prop("num", 3).find("a").text(3);

		templates["li"].clone().addClass("link_elem").prop("num", 2)
		.append(templates["a"].clone().text(2))
		.insertAfter(spread_left);
		
		pages_count = 3;
		return;
	} else {
		//Остальное количество элементов
		var li_t = templates["li"];
		var a_t = templates["a"];

		var vlink = (v_link>0) ? ((v_link<5) ? 5 : v_link) : 0;
		//Если <4 при элементах больших 5 страниц, то получается бред
		var num = 0;//сработает на нуле
		var arr = [];
		for(let i = 0; i<count; i++) {
			var residue = i%min_count;
			if(residue!==0) continue;
			num++;

			if(vlink) {
				if (num-1==vlink) {
					spread_right.show();
					continue;
				} else if(num>vlink) {
					continue;
				}
			}

			(i!=0) && arr.push(li_t.clone().addClass("link_elem").prop("num", num).append(a_t.clone().text(num)));
		}
		arr.pop();
		spread_left.after(arr);
		link_right.prop("num", num).find("a").text(num);
		pages_count = num;
	}
}

function clickPageNavigation(num, links) {
	//Вторая версия, т.к. первая просто ужасна
	/*
		Неизменяемые величины это крайние ссылки и spread/..., работаю с теми, что между "..."
	*/
	num -= 0;
	if(typeof (num-0) != "number") {
		return;
	}
	var old_num = num;
	var all_links = navigation_wrap.find(".link_elem");
	var links = all_links.not(".link_left,.link_right,.spread_left,.spread_right");
	var first_num = links.eq(0).prop("num");
	var last_num = links.last().prop("num");
	var left = link_left.prop("num");
	var right = link_right.prop("num");

	var count = links.length;

	all_links.filter(".active").removeClass("active");

	if(left == num) {
		renderLeft(num);//Если нажат самый левый якорный элемент
	} else if(right == num) {
		renderRight(num); //Если нажат самый правый якорный элемент
	} else {
		if((num == left+2) && spread_left.is(":visible")) {
			log(1);
			//Если num = 3 и left+2 = 3
			renderLeft(left);
		} else if((num == right-2) && spread_right.is(":visible")) {
			log(2);
			//Если num = right-2
			renderRight(right);
		} else if((num == first_num && spread_left.is(":visible")) || (num == last_num && spread_right.is(":visible"))) {
			log(3);
			renderDefault(num);
		}
		
	}

	all_links.each(function(i, item) {
		item = $(item);
		(item.prop("num")==old_num) && item.addClass("active");
	});

	function renderDefault(num) {
		//Перерисовываеи по умолчанию, если не первый или последнйи элемент
		spread_left.show();
		spread_right.show();
		switch(num) {
			case first_num:
				for (let i=count-1; i>=0; i--) {
					--last_num;
					item = links.eq(i);
					item.prop("num", last_num).find("a").text(last_num);
				}

				break;
			case last_num:
				for (let i=0; i<count; i++) {
					++first_num;
					item = links.eq(i);
					item.prop("num", first_num).find("a").text(first_num);
				}

				break;
		}
	}

	function renderLeft(left_num) {
			all_links.hide();

			link_left.show()
			.find("a")
			.text(left_num);
			link_right.show();
			
			spread_left.hide();
			spread_right.show();

			links.each(function(i, item) {
				left_num++;
				$(item).show()
				.prop("num", left_num)
				.find("a")
				.text(left_num);
			});
	}

	function renderRight(right_num) {
		all_links.hide();

		link_left.show();
		link_right.show()
		.find("a")
		.text(right_num);

		spread_right.hide();
		spread_left.show();

		for(let i = links.length-1; i>=0; i--) {
			right_num--;
			links.eq(i).show()
			.prop("num", right_num)
			.find("a")
			.text(right_num);
		}
	}
}

function showSelectProducts(page_num, _pages_count, filtering_products) {
	//Номер страницы, всего страниц, всего товаров
	if(filtering_products.length) log("-----"+1);
	else log("-----"+filtering_products);
	filtering_products = (filtering_products.length) ? $(filtering_products) : $(".product");
	filtering_products.hide();
	//log(filtering_products.length);
	page_num = page_num-0;
	pages_count = _pages_count-0;
	var q = page_num*min_count;//Край
	filtering_products.slice(q-min_count, q)
	.show();
	log(q-min_count, q);
/*
	Старая неработающая версия
	var product_length = filtering_products.length;
	var q = Math.ceil(product_length/pages_count);//quotient
	var select_products = page_num*q;
	filtering_products.slice(select_products-q, select_products)
	.show();*/
}

function resetOptions(parent) {
	parent.each(function(i, item) {
		var checkbox = parent.find(".checkbox_elem").removeClass("active_elem");
		item = $(item);
		item.find(".clear_elem").css("display", "none");
		/*
			То что в style DOM элемента приоритетнее, чем то что для него прописано в css,
			при передвижении ползунка меняется left, но в css right
			Для сброса значения мне проще просто удалить из style left и тогда применится значение из css.
			Но это неадекватно срабатывает, по этому могу присвоить none, что тоже сработывает неадеватно,
			поэтому присвою пустую строку		
		*/
		var sliders = item.find(".slider_elem");
		sliders.length && sliders.css("left", "");

		var tracers = item.find(".tracers");
		tracers.length && tracers.css("width", "");

		var values_container = item.find(".values_container");
		
		var value_type = item.prop("value_type");

		var postfix = "";
		switch(value_type) {
			case "prices":
				postfix=currency[current_locale];
				break;
		}

		if(values_container.length) {
			
			var data = store_data[value_type];
			var values = values_container.find(".values");
		
			if(values.length) {//Если есть элемент для значения, то min будет всегда
				values.filter(".min").text(data["min"]+postfix);
				data["sort_min"] = data["min"];
				
				var max = values.filter(".max");
				if(max.length) {
					data["sort_max"] = data["max"];
					max.text(data["max"]+postfix);
				}
			}

		}
	});
}

function calcOffset(el1, el2) {//Расчитывает позицию 1 элемента относительно второго на странице
	var pos1=$(el1).offset();//На всякий случай, вдруг DOM, место jQuery
	var pos2=$(el2).offset();
	return {"left": pos1.left-pos2.left, "top": pos1.top-pos2.top};
}

function parseCurrency(value, postfix="") {
	//Привожу 1000000 к 1 000 000
	/*
		Придется развернуть строку, иначе получается что-то такое с большими числами
		12017 = 1 201 7.
		Нужно = 12 017
	*/
	value+="";
	value = value.split("").reverse().join("");

	return value.replace(/(\d*)?(\.)?(\d*)/, (str, p1, p2, p3, p4)=>{
		//По регуляркам: *? вместо * - для ленивого поиска
		//Могут быть undefined:
		//Будет либо все 3, либо только 1
		

		p1=p1 || "";
		p2 = (p2) ? "," : "";
		p3 = p3 || "";
		if(!p3.length) [p1, p3]=[p3,p1];
		/*
			Если целое число, то p1=число, а оастальные undefined
		*/

		var result="";
		/*
			Строка неизменяемая сущность, в отличии от массива, с массивом быстрее в средем в 10 (8-12) раз
			но при использовании метода join быстрее работать со строкой в 1.5 раза в среднем, тестировал 
		*/
		
		for(let i=0; i<p3.length; i++) {
			result+=p3[i];
			if((i+1)%3==0) result+=" ";
		}
		result=result.trim();//усекаю лишнии пробелы, на всякий случай
		
		return p1+p2+result;
	}).split("").reverse().join("")+postfix;
}
})();