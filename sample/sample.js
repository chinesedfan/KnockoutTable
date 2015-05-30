function getUrlParam(name, targetStr) {
    var target = targetStr || window.location.search + window.location.hash,
        reg = new RegExp('[\\?#&]' + name + '=([^\\?#&]*)(\\?|#|&|$)', 'i'),
        matches = reg.exec(target);

    return matches ? decodeURIComponent(matches[1]) : '';
}

var test = getUrlParam('test') || '0';
var options = {
	"0": { data: WC2014Data },
	"1": { cell: { width: 50, height: 20, padding: 50 }, data: SimCityData }
};

var table = new KnockoutTable($('.J_container'), options[test]);
table.draw();