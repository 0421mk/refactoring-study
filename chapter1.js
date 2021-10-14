// json 데이터
var plays = {
	"hamlet": { "name": "Hamlet", "type": "tragedy" },
	"as-Like": { "name": "As You Like It", "type": "comedy" },
	"othello": { "name": "Othello", "type": "tragedy" }
};
// json 데이터
var invoices = {
	"customer": "BigCo",
	"performances": [
		{
			"playID": "hamlet",
			"audience": 55
		},
		{
			"playID": "as-Like",
			"audience": 35
		},
		{
			"playID": "othello",
			"audience": 40
		}
	]
};

// 다양한 연극을 외주로 받아서 공연하는 극단
// 공연 요청이 들어오면 연극의 장르와 관객 규모를 기초로 비용 책정
// 공연료와 별개로 포인트를 지급해서 다음번 의뢰 시 공연료 할인 가능

// 공연료 청구서를 출력하는 코드
function statement(invoice, plays) {
	let totalAmount = 0;
	let volumeCredits = 0;
	let result = `청구 내역 (고객명: ${invoice.customer})\n`;

	for (let perf of invoice.performances) {
		// 포인트 적립
		volumeCredits += volumeCreditsFor(perf);

		// 청구 내역 출력
		result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
		totalAmount += amountFor(perf);
	}

	result += `총액: ${usd(totalAmount)}\n`;
	result += `적립 포인트: ${volumeCredits}점\n`;
	return result;
}

// 매개변수의 역할이 뚜렷하지 않을 때 부정관사(a/an)을 붙인다.
function amountFor(aPerformance) {
	let result = 0;

	switch (playFor(aPerformance).type) {
		case "tragedy":
			result = 40000;
			if (aPerformance.audience > 30) {
				result += 1000 * (aPerformance.audience - 30);
			}
			break;
		case "comedy":
			result = 30000;
			if (aPerformance.audience > 20) {
				result += 10000 + 500 * (aPerformance.audience - 20);
			}
			result += 300 * aPerformance.audience;
			break;
		default:
			throw new Error('알 수 없는 장르 : ${play.type}');
	}
	return result;
}

function playFor(aPerformance) {
	return plays[aPerformance.playID];
}

function volumeCreditsFor(aPerformance) {
	let volumeCredits = 0;
	volumeCredits += Math.max(aPerformance.audience - 30, 0);
	// 희극 관객 5명마다 추가 포인트 제공
	if ("comedy" === playFor(aPerformance).type)
		volumeCredits += Math.floor(aPerformance.audience / 5);
	return volumeCredits;
}

// format => usd 메서드로 따로 생성하고 단위 변환 로직(/100)도 이동
function usd(aNumber) {
	return new Intl.NumberFormat("en-US", {
		style: "currency", currency: "USD",
		minimumFractionDigits: 2
	}).format(aNumber/100);
}
// 테스트 코드
console.log(statement(invoices, plays));