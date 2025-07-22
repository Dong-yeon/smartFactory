package com.smartFactory.mes.master.enums;

public enum ProcessType {
	INPUT("투입"),         // 투입
	ASSEMBLY("조립"),      // 조립
	PROCESSING("가공"),    // 가공
	INSPECTION("검사"),    // 검사
	PACKAGING("포장"),     // 포장
	OUTPUT("출하"),        // 출하
	STORAGE("보관"),       // 보관
	ETC("기타");            // 기타

	private final String korName;
	ProcessType(String korName) { this.korName = korName; }
	public String getKorName() { return korName; }
}
