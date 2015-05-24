function getUrlParam(name, targetStr) {
    var target = targetStr || window.location.search + window.location.hash,
        reg = new RegExp('[\\?#&]' + name + '=([^\\?#&]*)(\\?|#|&|$)', 'i'),
        matches = reg.exec(target);

    return matches ? decodeURIComponent(matches[1]) : '';
}

var test = getUrlParam('test') || '0';
var datas = {
	"0": WC2014Data,
	"1": SimCityData
};

var table = new KnockoutTable($('.J_container'), {
	data: datas[test]
});
table.draw();