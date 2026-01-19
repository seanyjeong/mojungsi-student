"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const studentScores = {
    subjects: [
        {
            name: '국어',
            subject: '화법과작문',
            std: 112,
            percentile: 69,
            grade: 4,
        },
        {
            name: '수학',
            subject: '확률과통계',
            std: 72,
            percentile: 7,
            grade: 8,
        },
        {
            name: '영어',
            grade: 2,
        },
        {
            name: '탐구',
            subject: '세계지리',
            std: 57,
            percentile: 72,
            grade: 4,
            group: '사탐',
        },
        {
            name: '탐구',
            subject: '사회문화',
            std: 61,
            percentile: 85,
            grade: 3,
            group: '사탐',
        },
        {
            name: '한국사',
            grade: 3,
        },
    ],
};
const expectedScores = {
    '가천대학교': {
        '운동재활학과': 68.90,
    },
    '가톨릭관동대학교': {
        '스포츠레저학전공': 479.50,
        '스포츠재활의학전공': 479.50,
        '체육교육과': 557.75,
    },
    '강남대학교': {
        '체육학과': 195.00,
    },
    '강원대학교': {
        '스포츠과학과': 147.20,
        '체육교육과': 249.50,
        '휴먼스포츠학과': 105.80,
    },
    '건국대학교': {
        '골프산업학과': 262.50,
        '스포츠건강관리학과': 262.50,
        '체육교육과': 406.56,
    },
    '건양대학교': {
        '스포츠의학전공': 915.00,
        '재활퍼스널트레이닝학과': 915.00,
    },
    '경기대학교': {
        '경호보안학과': 49.98,
        '스포츠과학부': 49.98,
        '체육학과': 49.98,
    },
    '경남대학교': {
        '체육교육과': 557.40,
    },
    '경동대학교': {
        '스포츠마케팅학과': 676.00,
        '체육학과': 0.00,
    },
    '경북대학교': {
        '체육교육과': 467.09,
        '체육학부(체육학전공)': 470.73,
    },
    '경상국립대학교': {
        '스포츠헬스케어학과': 592.62,
    },
    '경성대학교': {
        '스포츠건강학과': 237.00,
    },
    '경일대학교': {
        '스포츠복지학과': 102.60,
    },
    '경희대학교': {
        '골프산업학과': 396.10,
        '스포츠의학과': 396.10,
        '체육학과': 396.10,
        '태권도학과': 594.14,
    },
    '계명대학교': {
        '사회체육학과': 16.34,
        '스포츠마케팅학과': 257.00,
    },
};
async function main() {
    const prisma = new client_1.PrismaClient();
    const calculatorsModule = await import('./src/calculators/calculators.service.js');
    const CalculatorsService = calculatorsModule.CalculatorsService;
    const service = new CalculatorsService(prisma);
    console.log('========================================');
    console.log('디버깅.txt 검증 시작');
    console.log('========================================\n');
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const failedCases = [];
    for (const [univName, depts] of Object.entries(expectedScores)) {
        for (const [deptName, expectedScore] of Object.entries(depts)) {
            totalTests++;
            try {
                const basic = await prisma.jungsi_basic.findFirst({
                    where: {
                        year: 2025,
                        univ_name: univName,
                        dept_name: deptName,
                    },
                });
                if (!basic) {
                    console.log(`❌ [SKIP] ${univName} ${deptName}: DB에서 찾을 수 없음`);
                    failedTests++;
                    continue;
                }
                const result = await service.calculateScore({
                    U_ID: basic.U_ID,
                    year: 2025,
                    studentScores,
                });
                const actualScore = parseFloat(result.result.totalScore);
                const diff = Math.abs(actualScore - expectedScore);
                const tolerance = 0.01;
                if (diff <= tolerance) {
                    console.log(`✅ [PASS] ${univName} ${deptName}: ${actualScore} (예상: ${expectedScore})`);
                    passedTests++;
                }
                else {
                    console.log(`❌ [FAIL] ${univName} ${deptName}: ${actualScore} (예상: ${expectedScore}, 차이: ${diff.toFixed(2)})`);
                    failedTests++;
                    failedCases.push({
                        univ: univName,
                        dept: deptName,
                        expected: expectedScore,
                        actual: actualScore,
                        diff,
                    });
                }
            }
            catch (error) {
                console.log(`❌ [ERROR] ${univName} ${deptName}: ${error.message}`);
                failedTests++;
                failedCases.push({
                    univ: univName,
                    dept: deptName,
                    expected: expectedScore,
                    actual: -1,
                    diff: -1,
                });
            }
        }
    }
    console.log('\n========================================');
    console.log('테스트 결과 요약');
    console.log('========================================');
    console.log(`총 테스트: ${totalTests}`);
    console.log(`성공: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(2)}%)`);
    console.log(`실패: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(2)}%)`);
    if (failedCases.length > 0) {
        console.log('\n========================================');
        console.log('실패한 케이스 목록');
        console.log('========================================');
        failedCases.forEach(({ univ, dept, expected, actual, diff }) => {
            if (actual === -1) {
                console.log(`${univ} ${dept}: ERROR`);
            }
            else {
                console.log(`${univ} ${dept}: 예상 ${expected} / 실제 ${actual} / 차이 ${diff.toFixed(2)}`);
            }
        });
    }
    await prisma.$disconnect();
    process.exit(failedTests === 0 ? 0 : 1);
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-debug.js.map