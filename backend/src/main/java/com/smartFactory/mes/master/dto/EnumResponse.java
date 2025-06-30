package com.smartFactory.mes.master.dto;

public class EnumResponse {
	private final String code;
	private final String name;

	public EnumResponse(String code, String name) {
		this.code = code;
		this.name = name;
	}
	public String getCode() { return code; }
	public String getName() { return name; }
}
