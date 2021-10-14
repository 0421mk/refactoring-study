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

	// 중간 데이터 구조 역할을 할 객체 생성
	const statementData = {};
	// 고객 데이터와 공연 데이터를 중간 데이터로 옮김
	statementData.customer = invoice.customer;
	
	// {first}.map.({second})) => first 객체에 second 작업(또는 추가)를 거친 Json 객체값을 리턴
	statementData.performances = invoice.performances.map(enrichPerformance);
	
	//console.log(statementData.performances);
	//{
	//	"playID": "hamlet",
	//	"audience": 55,
	//	"play": {
	//		"name": "Hamlet",
	//		"type": "tragedy"
	//	}
	//}
	
	// 본문 전체를 별도 함수로 추출
	// 위 데이터로 인해 invoice 인수는 이제 필요가 없다
	return renderPlainText(statementData, plays);

	// {} 객체로 aPerformance 값을 겹치치 않는 요소를 살리면서 덮어쓰기
	// 즉 복사한다는 뜻, result는 복사된 값 출력
	// 복사를 한 이유는 함수로 건넨 데이터 인수를 수정하기 싫어서이다
	function enrichPerformance(aPerformance) {
		const result = Object.assign({}, aPerformance);
		result.play = playFor(result);
		return result;
	}

	function playFor(aPerformance) {
		return plays[aPerformance.playID];
	}
}

// 중간 데이터 구조 역할 객체를 통해 계산 관련 코드는 statement() 함수로 모으고 
// renderPlainText()는 data 매개변수로 전달된 데이터만 처리하게 만들 수 있다
function renderPlainText(data, plays) {
	let result = `청구 내역 (고객명: ${data.customer})\n`;

	for (let perf of data.performances) {
		// 청구 내역 출력
		result += `${perf.play.name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
	}

	result += `총액: ${usd(totalAmount())}\n`;
	result += `적립 포인트: ${totalVolumeCredits()}점\n`;
	return result;

	// 매개변수의 역할이 뚜렷하지 않을 때 부정관사(a/an)을 붙인다.
	function amountFor(aPerformance) {
		let result = 0;

		switch (aPerformance.play.type) {
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

	function volumeCreditsFor(aPerformance) {
		let result = 0;
		result += Math.max(aPerformance.audience - 30, 0);
		// 희극 관객 5명마다 추가 포인트 제공
		if ("comedy" === aPerformance.play.type)
			result += Math.floor(aPerformance.audience / 5);
		return result;
	}

	// format => usd 메서드로 따로 생성하고 단위 변환 로직(/100)도 이동
	function usd(aNumber) {
		return new Intl.NumberFormat("en-US", {
			style: "currency", currency: "USD",
			minimumFractionDigits: 2
		}).format(aNumber / 100);
	}

	function totalVolumeCredits() {
		let result = 0;
		// 반복문 쪼개기
		for (let perf of data.performances) {
			// 포인트 적립
			result += volumeCreditsFor(perf);
		}

		return result;
	}

	// 함수 결과값 변수는 result로 통일한다.
	function totalAmount() {
		let result = 0;

		for (let perf of data.performances) {
			result += amountFor(perf);
		}

		return result;
	}
}

// 테스트 코드
console.log(statement(invoices, plays));