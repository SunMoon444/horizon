<%@page import="com.horizon.core.HorizonCore"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" import="com.horizon.ueditor.ActionEnter" pageEncoding="UTF-8"%>
<%
    request.setCharacterEncoding( "utf-8" );
	response.setHeader("Content-Type" , "text/html");
	String rootPath = HorizonCore.PROJECT_PATH.value();//application.getRealPath( "/" );
	out.write( new ActionEnter( request, rootPath ).exec() );
%>