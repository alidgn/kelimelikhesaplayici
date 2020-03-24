

const btnClear = $('#btnClear');
const btnCalc = $('#btnCalc');
const inputWin = $('#inputWin');
const inputTotal = $('#inputTotal');
const btnArea = $('.btnArea');
const msgArea = $('.msgArea');

(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    };
}(jQuery));


inputWin.inputFilter(function (value) {
    ctrlButtonVisibility();
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 100000);
});

inputTotal.inputFilter(function (value) {
    ctrlButtonVisibility();
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 100000);
});

function ctrlButtonVisibility() {

    if (!(isNullOrWhitespace(inputWin.val())) && !(isNullOrWhitespace(inputTotal.val()))) {
        btnCalc.prop("disabled", false);
        btnCalc.parent().removeClass("col-12").addClass("col-6");
        btnClear.prop("hidden", false);
    } else {
        btnCalc.prop("disabled", true);
        btnCalc.parent().removeClass("col-6").addClass("col-12");
        btnClear.prop("hidden", true);
    }

}

function isNullOrWhitespace(input) {

    if (typeof input === 'undefined' || input == null || input === '') return true;

    return input.replace(/\s/g, '').length < 1;
}

btnCalc.click(function () {

    var result = checkRules();
    if (result.result) result = calculate();

    printMessages(result);
});

btnClear.click(function () {
    location.reload();
});

function checkRules() {
    var win = inputWin.val();
    var total = inputTotal.val();
    if (isNullOrWhitespace(win) || isNullOrWhitespace(total)) {
        return { result: false, messageType: "danger", messages: ["Lütfen tüm alanları doldurunuz."] };
    }
    else if (parseInt(win) > parseInt(total)) {
        return { result: false, messageType: "danger", messages: ["Kazanılan maç sayısı, toplam maç sayısından fazla olamaz."] };
    }

    return { result: true, messageType: "success", messages: ["Başarılı"], win: parseInt(win), total: parseInt(total) };
}

function printMessages(result) {

    msgArea.html("");

    var html = "";

    if (!(result.result)) html = printErrors(result);

    else {

        html = `<table class="table table-${result.messageType}"><tbody>`;
        var arr = result.messages;
        arr.forEach(element => {
            html += `<tr><td>${element.split('#')[0]}</td><th scope="row">${element.split('#')[1]}</th>`;
        });

        html += "</tbody></table>";

    }
    msgArea.html(html);
}

function printErrors(result) {

    var html = `<div class="alert alert-${result.messageType}"><ul>`;

    result.messages.forEach(element => {
        html += `<li>${element}</li>`;
    });

    html += "</ul></div>";

    return html;
}

function calculate() {

    var result = checkRules();
    if (!(result.result)) return result;

    var rate = calculateRate(result.win, result.total);
    var nextRate = rate + 1;
    var nextRateWins = getNextRate(result.win, result.total, 1);
    var messages = [
        `Kazanılan maç sayısı:#<span class="text-success">${result.win}</span>`,
        `Kaybedilen maç sayısı:#<span class="text-danger">${result.total - result.win}</span>`,
        `Toplam maç sayısı:#<span class="text-primary">${result.total}</span>`,
        `Başarı oranı:#<span class="text-info">%${rate}</span>`,
        `<strong>%${nextRate}</strong> için kazanılacak maç sayısı:#<span class="text-warning">${nextRateWins}</span>`,
    ]
    return { result: true, messageType: "dark", messages: messages };
}

function calculateRate(win, total) {
    win = parseInt(win);
    total = parseInt(total);
    return Math.round(win / total * 100);
}

function getNextRate(win, total, count) {
    var rate = calculateRate(parseInt(win), parseInt(total));
    var temp = rate;

    for (var c = 0; c < count; c++) {
        for (var i = 1; ; i++) {

            rate = calculateRate(parseInt(win) + i, parseInt(total) + i);

            if (rate > temp) {
                temp = rate;
                return i;
            }
        }
    }

    return 0;
}