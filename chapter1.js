// 1. 먼저 전체 동작을 각각 부분으로 나눌 수 있는 지점을 찾는다. => switch문
// 2. amountFor 함수를 만들고 내부 변수의 이름을 명확하게 변경한다.
// 3. play는 amountFor 안에 aPerformance에서 얻기 때문에 매개변수로 전달할 필요가 없다.

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

	// 블록 범위의 변수 선언
	// const는 블록 범위의 상수(재할당 불가) 선언
	// 언어에 맞는 통화(currency) 서식 지원, 소수부의 자릿수는 2
	const format = new Intl.NumberFormat("en-US", {
		style: "currency", currency: "USD",
		minimumFractionDigits: 2
	}).format;

	for (let perf of invoice.performances) {
		// 우변을 함수로 추출
		// 그 다음, 변수 인라인
		// let thisAmount = amountFor(perf, playFor(perf));
		const play = playFor(perf);
		let thisAmount = amountFor(perf, play);

		// 포인트 적립
		volumeCredits += Math.max(perf.audience - 30, 0);
		// 희극 관객 5명마다 추가 포인트 제공
		if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

		// 청구 내역 출력
		result += `${play.name}: ${format(thisAmount / 100)} (${perf.audience}석)\n`;
		totalAmount += thisAmount;
	}

	result += `총액: ${format(totalAmount / 100)}\n`;
	result += `적립 포인트: ${volumeCredits}점\n`;
	return result;
}

// 매개변수의 역할이 뚜렷하지 않을 때 부정관사(a/an)을 붙인다.
function amountFor(aPerformance, play) {
	let result = 0;

	switch (play.type) {
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
// 테스트 코드
console.log(statement(invoices, plays));