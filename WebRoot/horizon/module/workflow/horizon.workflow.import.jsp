<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="true" %>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<%@taglib uri="http://java.sun.com/jstl/core" prefix="c"%>
<link rel="stylesheet" href="<path:ctx/>/horizon/assets/module/form/css/horizon.form.css" />
<script src="<path:ctx/>/horizon/assets/common/js/horizon.base.js"></script>
<script>
    <c:if test="${not empty historyEnable}">
        horizon.form.history = horizon.form.history || {};
        horizon.form.history['enable'] = <c:out value="${historyEnable}"/>;
        <c:if test="${historyEnable == 'true' && historyRecords ne null}">
        horizon.form.history['records'] = <c:out value="${historyRecords}" escapeXml="false"/>;
        </c:if>
    </c:if>
    <c:if test="${not empty scripts}">
        <c:out value="${scripts}" escapeXml="false"/>
    </c:if>
</script>