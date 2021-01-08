<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="true"%>
<%@taglib uri="http://java.sun.com/jstl/core" prefix="c"%>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="form"%>
<div class="page-content no-padding-bottom">
<div class="row">
	<div class="col-xs-12"  >
		<c:set var="name" value="${fields['姓名'].field}"/>
	    <c:set var="auth" value="${fields['姓名'].author}"/>
	    <c:set var="val"  value="${datas[fields['姓名'].dataKey]}"/>
		<div class="form-group <c:if test="${auth eq 'check'}">has-error</c:if>">
			<label class="col-xs-12 col-sm-3 control-label">姓名:</label>
			<div class="col-xs-12 col-sm-5 ">
			  <c:choose>
			  	<c:when test="${auth eq 'read'}">
			  	 <label class="form-control form-read-lable"><c:out value="${val}"/></label>
			  	 <input type="hidden" name="<c:out value="${name}"/>" value="<c:out value="${val}"/>"/>
			  	</c:when>
			  	<c:when test="${auth eq 'hidden'}">
			  	 <input type="hidden" name="<c:out value="${name}"/>" value="<c:out value="${val}"/>"/>
			  	</c:when>
			  	<c:otherwise>
			  	<input class="form-control" <c:if test="${auth eq 'check'}">required</c:if> type="text" name="<c:out value="${name}"/>"  value="<c:out value="${val}"/>"/>
			  	</c:otherwise>
			  </c:choose>
			</div>
		</div>
	</div>
	<div class="col-xs-12"  >
		<c:set var="name" value="${fields['年龄'].field}"/>
	    <c:set var="auth" value="${fields['年龄'].author}"/>
	    <c:set var="val"  value="${datas[fields['年龄'].dataKey]}"/>
		<div class="form-group <c:if test="${auth eq 'check'}">has-error</c:if>">
			<label class="col-xs-12 col-sm-3 control-label">年龄:</label>
			<div class="col-xs-12 col-sm-5 ">
			  <c:choose>
			  	<c:when test="${auth eq 'read'}">
			  	 <label class="form-control form-read-lable"><c:out value="${val}"/></label>
			  	 <input type="hidden" name="<c:out value="${name}"/>" value="<c:out value="${val}"/>"/>
			  	</c:when>
			  	<c:when test="${auth eq 'hidden'}">
			  	 <input type="hidden" name="<c:out value="${name}"/>" value="<c:out value="${val}"/>"/>
			  	</c:when>
			  	<c:otherwise>
			  	<input class="form-control" <c:if test="${auth eq 'check'}">required</c:if> type="text" name="<c:out value="${name}"/>"  value="<c:out value="${val}"/>"/>
			  	</c:otherwise>
			  </c:choose>
			</div>
		</div>
	</div>
</div>
</div>
<form:id/>
<form:data/>
<form:table/>