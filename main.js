'use strict';
 // определение основных DOM элементов
const $mainPart = document.getElementById('main_part');
const $content = document.getElementById('content');

// создание объекта-шаблона для отрисовки карточки фильмов и страниц фильмов
let movie = {
	src: '',
	id: '',
	name: '',
	description: '',
	imdb: '',
	originalFilmName: '',
	year: '',
	country: '',
	tagline: '',
	director: '',
	actors: '',
	positions: {},
	names: {},
	like: 0,
	dislike: 0
};

// создания массивов для взаимодействия с локальным хранилищем
let filmsArr = [];
let positionsArr = [];
let namesArr = [];


// ФУНКЦИИ

// функции сохранения информации о фильмах в локальном хранилище
let saveFilm = () => {
	localStorage.setItem('films', JSON.stringify(filmsArr));
};

let savePositions = () => {
	localStorage.setItem('positions', JSON.stringify(positionsArr));
};

let saveNames = () => {
	localStorage.setItem('names', JSON.stringify(namesArr));
};


// функция сбора информации о фильме из локального хранилища
let makeInformation = (card) => {

	filmsArr = JSON.parse(localStorage.getItem('films'));
	positionsArr = JSON.parse(localStorage.getItem('positions'));
	namesArr = JSON.parse(localStorage.getItem('names'));


	positionsArr.forEach( position => {  /*локальное хранилище дополнительных должностей*/
		if (+card.id === position.id) {
			movie.positions = position;
		}
	});

	namesArr.forEach( name => { /*локальное хранилище дополнительных имён*/
		if (+card.id === name.id) {
			movie.names = name;
		}
	});

	filmsArr.forEach( film => { /*сбор основной информации о фильме*/
		if (+card.id === film.id) {
			movie.src = film.poster;
			movie.id = film.id;
			movie.year = film.year;
			movie.name = film.name;
			movie.description = film.description;
			movie.imdb = film.imdb;
			movie.originalFilmName = film.originalFilmName;	
			movie.country = film.country;
			movie.tagline = film.tagline;
			movie.director = film.director;
			movie.actors = film.actors;
			movie.like = film.like;
			movie.dislike = film.dislike;
			movie.poster = film.poster;
		}	
	});	
};

// функция отображения карточек всех фильмов
let showAllMovies = () => {
	location.hash = '#list';
	$content.innerHTML = '';
	filmsArr = JSON.parse(localStorage.getItem('films'));
	if (filmsArr === null || filmsArr.length === 0) { /*если в хранилище нет фильмов или нет хранилища*/
		$content.innerHTML = 'В базе отсутствуют фильмы!';
	} else {
		filmsArr.forEach((element) => {
			printCard(element);
		});
	}	
};

// функция создания карточки фильма
let printCard = (element) => {

	movie.src = element.poster;
	movie.id = element.id;
	movie.name = element.name;
	movie.description = element.description;
	movie.imdb = element.imdb;

	
	const newCard = document.createElement('div');
	newCard.classList.add('card', 'mt-3');
	newCard.id = element.id;
	newCard.style.maxWidth = "48%";

	const cardSample = document.getElementById('cardTemplate').innerHTML;
	const template = _.template(cardSample);
	newCard.innerHTML = template(element);
	$content.appendChild(newCard);	
};

// функция создания страницы подробной информации
let printMoviePage = () => {
	fetch('movieTemplate.html')
		.then(function(response) {
			response.text()
			.then(function(text) {
				const modalSample = text;
				const template = _.template(modalSample);
				$content.innerHTML = template();
			});
		});
};

// функция удаления фильма из хранилища и карточки фильма
let deleteMovie = (card) => {
	filmsArr.forEach((item) => {
		if (item.id === +card.id) {
			filmsArr.splice(filmsArr.indexOf(item), 1);
			saveFilm();	
		}
	});
	positionsArr.forEach((item) => {
		if (item.id === +card.id) {
			positionsArr.splice(positionsArr.indexOf(item), 1);
			savePositions();	
		}
	});
	namesArr.forEach((item) => {
		if (item.id === +card.id) {
			namesArr.splice(namesArr.indexOf(item), 1);
			saveNames();	
		}
	});
};

// функция добавления нового фильма в локальное хранилище
let addNewMovie = () => {
	const $modal = document.getElementById('modal');
	const $poster = document.getElementById('upload-poster');
	const actorsArr = document.getElementById('actors').value.split(',');
	const $form = document.getElementById('form');

	let newFilm = {
		id: Date.now(),
		name: document.getElementById('film-name').value,
		originalFilmName: document.getElementById('original-film-name').value,
		year: document.getElementById('year').value,
		country: document.getElementById('country').value,
		tagline: document.getElementById('tagline').value,
		director: document.getElementById('director').value,
		actors: actorsArr,
		imdb: document.getElementById('imdb').value,
		description: document.getElementById('description').value,
		like: 0,
		dislike:0
	};


	// если у формы есть класс идентичный ID фильма из хранилища, то пересохраняем этот ID и количество лайков/дислайков и удалем из базы редактируемый фильм, чтоб избежать дублирования
	if (+$form.classList[2] === movie.id) {
		newFilm.id = movie.id;
		newFilm.like = movie.like;
		newFilm.dislike = movie.dislike;
		newFilm.poster = movie.poster;
		deleteMovie(movie);
	}

	let newPositions = {
		id: newFilm.id
	};

	let newNames = {
		id: newFilm.id
	};

	document.querySelectorAll('.employee-position').forEach( (position, i, arr) => {
		newPositions[i] = position.value;
	});

	document.querySelectorAll('.employee-name').forEach( (name, i, arr) => {
		newNames[i] = name.value;
	});

	positionsArr.push(newPositions);
	namesArr.push(newNames);

	savePositions();
	saveNames();

	if ($poster.value !== '') {
		const fr = new FileReader();
		fr.readAsDataURL($poster.files[0]);
		fr.addEventListener('load', () => {

			newFilm.poster = fr.result;
			
			filmsArr.push(newFilm);
			saveFilm();	
			
			$('#modal').modal('toggle');
		});
	} else {
		
		filmsArr.push(newFilm);
		saveFilm();	
			
		$('#modal').modal('toggle')
	}
	

	setTimeout(function() {showAllMovies ()}, 500); /*отображение всех карточек, но т.к. прогрузить изображение и убрать модалку занимает время - использован таймер*/
};

// функция поиска фильма в базе
let search = () => {
	location.hash = '#search';
	$content.innerHTML = '';

	let searchValue = document.getElementById('search-input').value;

	if (searchValue === '') { /*при обновлении страницы поиска либо при поиске с пустой строкой - поиск проводиться по последнему запросу*/
		searchValue = localStorage.getItem('lastSearch');
	}

	filmsArr = JSON.parse(localStorage.getItem('films'));
	let x = 0; /*временная переменная "маячёк", который сигналит об отсутствие подходящих фильмов*/
	
	filmsArr.forEach((element) => {
		let a = 0; /*временная переменная "маячёк", который меняется при совпадении каждого слова в строке поиска и названии. Иначе при поиске из нескольких слов, при совпадении каждого слова отображается новая карточка*/
		searchValue.split(' ').forEach( (item, i, arr) => { /*разделение поискового запроса на слова*/
			let reg = new RegExp( item,'i'); /*преобразование каждого слова в регулярное выражение*/
			let result = element.name.match(reg); /*поиск каждого слова в названии фильма*/
			if (result) {
				a++; /*при совпадении каждого слова изменяем значение маячков*/
				x++; 
			}
		});
		if (a > 0) { /*если маячек больше ноля, значит хоть одно слово совпало и можно отображать карточку фильма*/
			printCard(element);
		}
	});

	if (x === 0) { /*если маячек не изменился, значит ниодного совпадения нет*/
		$content.innerText = 'НИЧЕГО НЕ НАЙДЕНО =(';
	}

	localStorage.setItem('lastSearch', searchValue); /*сохранение последнего запроса в локальном хранилище*/
};

// функция поиска ближайнего родителя с нужным селектором
let getParent = (elem, parentSelector) => {
	var parents = document.querySelectorAll(parentSelector);

	for (let i = 0; i < parents.length; i++) {
		const parent = parents[i];

		if (parent.contains(elem)) {
			return parent;
		}
	}

	return null;
};

// если в локальном хранилище есть данные - скопировать в массивы для обработки информации о фильмах
if (localStorage.getItem('films') && localStorage.getItem('positions') && localStorage.getItem('names')) {
	filmsArr = JSON.parse(localStorage.getItem('films'));
	positionsArr = JSON.parse(localStorage.getItem('positions'));
	namesArr = JSON.parse(localStorage.getItem('names'));
}


// обработка событий submit
$mainPart.addEventListener('submit', ({target: element}) => {

	if (element.id === 'form') {
		event.preventDefault();
		addNewMovie();
	}

	if (element.id === 'search') {
		event.preventDefault();
		search();
	}
});

// обработка событий при кликах на элементы
$mainPart.addEventListener('click', ({target: element}) => {
	// отрисовка модального окна при нажатии кнопки добавления фильма
	if (element.id === 'add-new') { 
		fetch('add-new.html')
		.then(function(response) {
			response.text()
			.then(function(text) {
				$('#content').append(text);
				$('#modal').modal('show');
			});
		});
	}
	// закрытие модального окна
	if (element.id === 'btn-close' || element.id === 'close') {
		$('#modal').modal('toggle');
		document.getElementById('modal').remove();
	}
	// добавление дополнительных инпутов для дополнительных должностей
	if (element.id === 'btn-add' || element.parentElement.id === 'btn-add') {
		const $detail = document.getElementById('detail');
		const $newPosition = document.createElement('div');
		$newPosition.classList.add('form-group', 'row');
		$newPosition.innerHTML = 
			`<div class="col-sm-5">
				<input type="text" class="form-control employee-position" placeholder="Должность" required>
			</div>
			<div class="col-sm-5">
				<input type="text" class="form-control employee-name" placeholder="Имя" required>
			</div>
			<div class="col-sm-2">
				<button class="btn btn-danger btn-sm btn-remove-field" type="button" id="btn-delete">
					<svg class="octicon octicon-x" viewBox="0 0 14 18" version="1.1" width="14" height="18" aria-hidden="true">
						<path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path>
					</svg>
				</button>
			</div>`;
		$detail.insertBefore($newPosition, $detail.children[5]);	
	}
	// удаление дополнительных полей
	if (element.id === 'btn-delete' || element.parentElement.id === 'btn-delete') {
		getParent(element, '.row').remove();	
	}
	// отображение всех карточек фильмов
	if (element.id === 'all-movies') {
		showAllMovies();
	}
	// удаление фильма из базы и его карточки
	if (element.classList.contains('btn-delete') || element.parentElement.classList.contains('btn-delete')) {
		const question = confirm('Удалить фильм?');
		const card = getParent(element, '.card');
		
		if (question) {
			deleteMovie (card);
			card.remove();
		}
	}
	// отображение заполненного модального окна при нажатии на кнопку редактирования фильма
	if (element.classList.contains('btn-edit') || element.parentElement.classList.contains('btn-edit')) {
		const card = getParent(element, '.card');
		makeInformation(card);

		const modalSample = document.getElementById('modalTemplate').innerHTML;
		const template = _.template(modalSample);

		$('#content').append(template());
	
		$('#modal').modal('show');	
	}
	// отображение полной информации о фильме при нажатии на ссылку "подробнее"
	if (element.classList.contains('more')) {
		const card = getParent(element, '.card');
		makeInformation(card);
		printMoviePage();		
	}
	// обработка лайка и дислайка 
	if (element.classList.contains('like')) {
		element.parentElement.dataset.count++; /*увеличение значения счётчика*/
		let $moviePage = document.querySelector('.movie-details');
		filmsArr = JSON.parse(localStorage.getItem('films')); /*сохранение количества лайков в локальном хранилище соответствующего фильма*/
		filmsArr.forEach( item => {
			if (+$moviePage.id === item.id) {
				item.like++;
				saveFilm();
			}
		});
	}

	if (element.classList.contains('dislike')) {
		element.parentElement.dataset.count++;
		let $moviePage = document.querySelector('.movie-details');
		filmsArr = JSON.parse(localStorage.getItem('films'));
		filmsArr.forEach( item => {
			if (+$moviePage.id === item.id) {
				item.dislike++;
				saveFilm();
			}
		});
	}
});



// функция роутинга
let handleRouting = () => {
	const route = location.hash;
	const hashArr = route.split('-');
	const hashId = {
		id: hashArr[1]
	};

	switch (route) {
		case '#list' :
			showAllMovies();

			break;
		case `#list-${hashId.id}` :
			$content.innerHTML = '';
			makeInformation(hashId);
			printMoviePage();

			break;
		case '#search' : 
			search();

			break;	
	}
};

window.addEventListener('hashchange', handleRouting());