function showHome() {
	var setting = document.getElementById('setting');
	var home = document.getElementById('home');
	var about = document.getElementById('about');
	home.style.display = 'block';
	about.style.display = 'none';
	
	document.getElementById('cssmenuHome').classList.add('active');
	document.getElementById('cssmenuAbout').classList.remove('active');
}

function showAbout() {
	var setting = document.getElementById('setting');
	var home = document.getElementById('home');
	var about = document.getElementById('about');
	home.style.display = 'none';
	about.style.display = 'block';
	
	document.getElementById('cssmenuHome').classList.remove('active');
	document.getElementById('cssmenuAbout').classList.add('active');
}
		