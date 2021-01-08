<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="true" %>
<%@taglib uri="http://www.horizon.cn/taglib/path" prefix="path"%>
<%@taglib uri="http://java.sun.com/jstl/core" prefix="c"%>
<!DOCTYPE html>
<html lang='<path:i18n key="lang"/>'>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title><c:out value="${workFlow.flowName}"/></title>
    <%@include file="../../common/bootstrap.css.include.jsp"%>
    <link rel="stylesheet" href="<path:frontPath/>/jquery/jquery-ui/css/jquery-ui.css" />
    <link rel="stylesheet" href="<path:frontPath/>/gritter/css/jquery.gritter.css" />
    <link rel="stylesheet" href="<path:frontPath/>/ztree/css/zTreeStyle/zTreeStyle.css" />
    <%@include file="../../common/ace.css.include.jsp"%>
    <%@include file="../../common/base.css.include.jsp"%>
    <%@include file="../../common/base.script.include.jsp"%>
    <script type="text/javascript">
        horizon.lang.workflow = <path:i18n group="workflow"/>;
    </script>
    <c:if test="${not empty workFlowImport}">
        <c:catch var="jspException">
            <c:import url="${workFlowImport}"/>
        </c:catch>
        <c:if test="${not empty jspException}">
            <script type="text/javascript">
                alert("<c:out value="${jspException}"/>");
            </script>
        </c:if>
    </c:if>
    <%@include file="../../common/oldbrowser.script.include.jsp"%>
</head>
<body class="workflow-body overflow-hidden">
<c:choose>
<c:when test="${empty workFlow.openType}">
	<div class="alert alert-danger alert-inflow bigger-110 center"><c:out value="${workFlow.flowMsg}"/></div>
</c:when>
<c:when test="${workFlow.selectNodes ne null and workFlow.openType eq 'false'}">
	<form class="form-horizontal" role="form">
        <div class="alert alert-info alert-inflow bigger-110 center">
            <div class="control-group">
                <label class="control-label bolder blue"><path:i18n group="workflow" key="selectActiveNode" /></label>
                <br/>
                <label class="control-label">
                    <c:forEach var="node" items="${workFlow.selectNodes}"  varStatus="i">
                        <div class="radio align-left">
                            <label>
                                <input name="trackId" type="radio" class="ace" value="<c:out value="${node.trackId}"/>" />
                                <span class="lbl"> <c:out value="${node.nodeName}"/> </span>
                            </label>
                        </div>
                    </c:forEach>
                </label>
                <input type="hidden" name="workId" value="<c:out value="${workFlow.workId}"/>"/>
                <div class="hr hr-dotted hr18"></div>
                <p><button type="submit" class="btn btn-sm btn-success"><path:i18n group="workflow" key="ok" /></button></p>
            </div>
        </div>
    </form>
</c:when>
<c:otherwise>
	<div class="main-container">
        <!-- 操作开始 -->
        <div class="flow-buttons">
            <ul class="nav nav-pills no-margin">
                <c:forEach var="button" items="${workFlow.flowButtons}" varStatus="i">
                    <li class="hidden">
                        <a href="javascript:void(0);" data-operate="<c:out value="${button.buttonId}"/>" data-clazz="<c:out value="${button.buttonClass}"/>" data-text="<c:out value="${button.buttonName}"/>">
                            <i class="ace-icon <c:out value="${button.icon}"/>"></i>
                            <c:out value="${button.buttonName}"/>
                        </a>
                    </li>
                </c:forEach>
                <li>
                    <a href="javascript:void(0);" data-operate="close" >
                        <i class="ace-icon fa fa-times"></i> <path:i18n group="workflow" key="close" />
                    </a>
                </li>
                <li class="more hidden">
                    <a href="javascript:void(0);" data-toggle="dropdown" class="dropdown-toggle">
                        <i class="ace-icon fa fa-list"></i>
                        <path:i18n group="workflow" key="more" />
                    </a>
                    <ul class="dropdown-menu dropdown-light-blue dropdown-caret dropdown-menu-right">
                        <c:forEach var="button" items="${workFlow.flowButtons}" varStatus="i">
                            <li class="hidden">
                                <a href="javascript:void(0);" data-operate="<c:out value="${button.buttonId}"/>" data-clazz="<c:out value="${button.buttonClass}"/>">
                                    <i class="ace-icon <c:out value="${curButton.icon}"/>"></i>
                                    <c:out value="${button.buttonName}"/>
                                </a>
                            </li>
                        </c:forEach>
                        <li class="hidden">
                            <a href="javascript:void(0);" data-operate="close" >
                                <i class="ace-icon fa fa-times"></i> <path:i18n group="workflow" key="close" />
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <!-- 操作结束 -->
        <div class="flow-body">
            <c:if test="${workFlow.openType eq 'false'}">
                <div class="alert alert-danger alert-inflow bigger-110 center"><c:out value="${workFlow.flowMsg}"/></div>
            </c:if>
            <div class="tabbable">
                <ul class="nav nav-tabs" id="myTab">
                <c:forEach var="form" items="${workFlow.flowForms}" varStatus="i">
                    <li <c:if test="${form.isDef eq 'true'}">class="active"</c:if>>
                        <a data-toggle="tab" href="#<c:out value="${form.formId}"/>">
                            <c:out value="${form.formName}"/>
                        </a>
                    </li>
                </c:forEach>
                </ul>
                <form class="base-form form-horizontal" role="form" method="post">
                    <c:choose>
                    	<c:when test="${workFlow.flowForms ne null}">
                    	 <div class="tab-content no-padding-left no-padding-right no-padding-top">
                        <c:forEach var="form" items="${workFlow.flowForms}" varStatus="i">
                            <c:choose>
                                <c:when test="${form.formId eq 'FlowTrack'}">
                                    <!-- 流程跟踪 -->
                                    <div id="<c:out value="${form.formId}"/>" class="empty tab-pane fade <c:if test="${form.isDef eq 'true'}">active in</c:if>">
                                        <div class="row no-margin">
                                            <div class="col-xs-12">
                                                <div class="widget-box transparent">
                                                    <div class="widget-header">
                                                        <h5 class="widget-title lighter">
                                                            <i class="ace-icon fa fa-sitemap"></i> <path:i18n group="workflow" key="flowChart" />
                                                        </h5>
                                                        <div class="widget-toolbar">
                                                            <a href="javascript:void(0);" data-action="collapse">
                                                                <i class="ace-icon fa fa-chevron-up"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div class="widget-body">
                                                        <div class="widget-main no-padding-left no-padding-right">
                                                            <div class="flowchart-container"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="widget-box transparent">
                                                    <div class="widget-header">
                                                        <h5 class="widget-title lighter">
                                                            <i class="ace-icon fa fa-clock-o"></i> <path:i18n group="workflow" key="history" />
                                                        </h5>
                                                        <div class="widget-toolbar">
                                                            <div class="widget-menu">
                                                                <a href="javascript:void(0);" data-action="settings" data-toggle="dropdown">
                                                                    <i class="ace-icon fa fa-bars"></i>
                                                                </a>
                                                                <ul class="dropdown-menu dropdown-menu-right dropdown-light-blue dropdown-caret dropdown-closer">
                                                                    <li class="active">
                                                                        <a href="javascript:void(0)" data-action="timeline">
                                                                            <i class="ace-icon fa fa-clock-o"></i> <path:i18n group="workflow" key="timeLine" />
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="javascript:void(0)" data-action="table">
                                                                            <i class="ace-icon fa fa-list-alt"></i> <path:i18n group="workflow" key="table" />
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <a href="javascript:void(0);" data-action="collapse"> <i class="ace-icon fa fa-chevron-up"></i> </a>
                                                        </div>
                                                    </div>
                                                    <div class="widget-body">
                                                        <div class="widget-main no-padding-left no-padding-right note-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </c:when>
                                <c:when test="${form.formType eq 'JSP'}">
                                    <!-- 外部表单 -->
                                    <div id="<c:out value="${form.formId}"/>" class="tab-pane fade <c:if test="${form.isDef eq 'true'}">active in</c:if>">
                                        <div class="row no-margin form-body">
                                            <div class="col-xs-12">
                                                <c:catch var="jspException">
                                                    <c:import url="${form.formBody}">
                                                        <c:param name="formId" value="${form.formId}"/>
                                                        <c:param name="dataId" value="${form.formDataId}"/>
                                                        <c:param name="isNew"  value="${form.isNewData}"/>
                                                    </c:import>
                                                </c:catch>
                                                <c:if test="${not empty jspException}">
                                                    <div class="red"><c:out value="${jspException}"/></div>
                                                </c:if>
                                            </div>
                                        </div>
                                    </div>
                                </c:when>
                                <c:otherwise>
                                    <!-- 定制表单 -->
                                    <div id="<c:out value="${form.formId}"/>" class="tab-pane fade <c:if test="${form.isDef eq 'true'}">active in</c:if>">
                                        <c:if test="${forms[form.formId].formButtons ne null}">
                                            <div class="row no-margin">
                                                <div class="col-xs-12 form-buttons">
                                                    <ul class="nav nav-pills no-margin">
                                                        <c:forEach var="formButton" items="${forms[form.formId].formButtons}" varStatus="k">
                                                            <li>
                                                                <a href="javascript:void(0)" onclick="<c:out value="${formButton.func}"/>">
                                                                    <c:if test="${formButton.buttonIcon ne null }">
                                                                        <i class="ace-icon <c:out value="${formButton.buttonIcon}"/> hidden-xs"></i>
                                                                    </c:if>
                                                                    <c:if test="${formButton.buttonIcon eq null || formButton.buttonIcon == ''}">
                                                                        <i class="ace-icon fa fa-coffee hidden-xs"></i>
                                                                    </c:if>
                                                                    <c:out value="${formButton.buttonName}"/>
                                                                </a>
                                                            </li>
                                                        </c:forEach>
                                                    </ul>
                                                </div>
                                            </div>
                                        </c:if>
                                        <div class="row no-margin form-body">
                                            <div class="col-xs-12"><c:out value="${bodys[form.formId]}" escapeXml="false"/></div>
                                            <input type="hidden" name="<c:out value="${form.formId}"/>_WORKFLOW_DATA" value='<c:out value="${form.formDataId}"/>'/>
                                        </div>
                                    </div>
                                </c:otherwise>
                            </c:choose>
                        </c:forEach>
                    	</div>
                    	</c:when>
                    	<c:otherwise><div class="alert alert-danger alert-inflow bigger-110 center"><path:i18n group="workflow" key="noPermission" /></div></c:otherwise>
                    </c:choose>
                    <div id="right-menu" class="modal aside" data-body-scroll="false" data-offset="true" data-placement="right" data-fixed="<path:prop name="workflow.fixedModal"/>" data-backdrop="invisible" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-body">
                                    <h5 class="header lighter blue no-margin">
                                        <i class="ace-icon fa fa-lightbulb-o"></i> <path:i18n group="workflow" key="handleStatus" />
                                        <label class="pull-right">
                                            <a id="fixed-modal" class="pointer"><i class="ace-icon fa fa-unlock bigger-160" data-fixed-icon="fa-lock" data-unfixed-icon="fa-unlock"></i></a>
                                        </label>
                                    </h5>
                                    <div class="space-6"></div>
                                    <div class="well well-sm">
                                        <div class="row no-margin">
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <i class="ace-icon fa fa-circle-o green bigger-110"></i>
                                                <path:i18n group="workflow" key="currentNode" />:
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <span class="orange text-break"> <c:out value="${workFlow.flowNode.nodeName}"/> </span>
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <i class="ace-icon fa fa-edit green smaller-90"></i>
                                                <path:i18n group="workflow" key="transactor" />:
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <span class="orange text-break"> <c:out value="${workFlow.flowUser.transactorName}"/> </span>
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <i class="ace-icon fa fa-flag green smaller-90"></i>
                                                <path:i18n group="workflow" key="flowStatus" />:
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <span class="orange"> <c:out value="${workFlow.flowStatusName}"/> </span>
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <i class="ace-icon fa fa-user green bigger-110"></i>
                                                <path:i18n group="workflow" key="currentUser" />:
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <span class="orange text-break"> <c:out value="${workFlow.flowUser.userName}"/> </span>
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <i class="ace-icon fa fa-gavel green smaller-90"></i>
                                                <path:i18n group="workflow" key="userIdentity" />:
                                            </label>
                                            <label class="col-xs-12 col-sm-6 no-padding control-label">
                                                <span class="orange text-break"> <c:out value="${workFlow.flowUser.authorName}"/> </span>
                                            </label>
                                        </div>
                                    </div>
                                    <h5 class="header lighter blue no-margin">
                                        <i class="ace-icon fa fa-pencil-square-o"></i>
                                        <path:i18n group="workflow" key="comment" />
                                    </h5>
                                    <div class="space-6"></div>
                                    <div>
                                        <textarea placeholder=<path:i18n group="workflow" key="commentPlaceholder" /> name="comment" class="form-control" rows="8"></textarea>
                                    </div>
                                </div>
                            </div>
							<button class="aside-trigger btn btn-info btn-app btn-xs ace-settings-btn" data-target="#right-menu" data-toggle="modal" type="button">
								<i data-icon1="fa-fire" data-icon2="fa-minus" class="ace-icon fa fa-fire bigger-110 icon-only"></i>
							</button>
						</div>
                    </div>
                    <div class="hide">
                        <input type="hidden" name="flowId"     value='<c:out value="${workFlow.flowId}"/>'/>
                        <input type="hidden" name="workId"     value='<c:out value="${workFlow.workId}"/>'/>
                        <input type="hidden" name="subjection" value='<c:out value="${workFlow.subjectionId}"/>'/>
                        <input type="hidden" name="authorKey"  value='<c:out value="${workFlow.authorKey}"/>'/>
                        <input type="hidden" name="nodeId"     value='<c:out value="${workFlow.flowNode.nodeId}"/>'/>
                        <input type="hidden" name="nodeName"   value='<c:out value="${workFlow.flowNode.nodeName}"/>'/>
                        <input type="hidden" name="trackId"    value='<c:out value="${workFlow.flowNode.trackId}"/>'/>
                        <input type="hidden" name="userId"     value='<c:out value="${workFlow.flowUser.userId}"/>'/>
                        <input type="hidden" name="userName"   value='<c:out value="${workFlow.flowUser.userName}"/>'/>
                        <input type="hidden" name="deptId"     value='<c:out value="${workFlow.flowUser.deptId}"/>'/>
                        <input type="hidden" name="deptName"   value='<c:out value="${workFlow.flowUser.deptName}"/>'/>
                        <input type="hidden" name="unValidate" value='<path:prop name="workflow.unValidate"/>'/>
                    </div>
                </form>
            </div>
        </div>
        <a href="javascript:void(0);" id="btn-scroll-up" class="btn-scroll-up btn btn-sm btn-inverse">
        	<i class="ace-icon fa fa-angle-double-up icon-only bigger-110"></i>
        </a>
	</div>
    <div class="templates hidden">
        <div class="horizon-dialog-modal modal fade" tabindex="-1" role="dialog">
            <div class="modal-backdrop in"></div>
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><i class="ace-icon fa fa-times"></i></button>
                        <h5 class="modal-title">
                            <i class="ace-icon fa fa-sitemap blue"></i>
                            <span class="modal-title-text"></span>
                        </h5>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <div class="msg-type-container col-xs-12 col-sm-6 align-left no-padding"></div>
                        <div class="col-xs-12 col-sm-6 no-padding">
                            <button type="button" class="horizon-btn btn btn-primary" data-action="submit">
                                <i class="ace-icon fa fa-check"></i><path:i18n group="workflow" key="ok" />
                            </button>
                            <button type="button" class="horizon-btn btn btn-default" data-dismiss="modal">
                                <i class="ace-icon fa fa-times"></i><path:i18n group="workflow" key="close" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="panel-group accordion-style1 accordion-style2" data-required="true"></div>
        <div data-setup="true" class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a class="accordion-toggle" data-toggle="collapse">
                        <i class="panel-title-icon bigger-110 ace-icon fa" data-icon-hide="fa-angle-down" data-icon-show="fa-angle-right"></i>
                        <span class="panel-title-text"></span>
                        <i class="panel-list-icon bigger-110 ace-icon fa fa-list blue pull-right hidden"></i>
                    </a>
                </h4>
            </div>
            <div class="panel-collapse collapse">
                <div class="panel-body no-padding-right empty">
                    <i class="ace-icon fa fa-spinner fa-spin orange bigger-125"></i>
                </div>
            </div>
        </div>
        <div class="tag-box col-xs-6 col-sm-4 col-md-3 col-lg-2 align-center">
            <span class="tag">
                <span class="tag-text"></span>
                <button type="button" class="close">
                    <i class="ace-icon fa fa-times"></i>
                </button>
            </span>
        </div>
        <div data-setup="true" data-axis="<path:prop name="workflow.freesubmit.axis"/>" class="free-node-box padding-10 no-padding-top no-padding-left no-padding-right">
            <div class="row">
                <div class="col-sm-5" data-for="nodeName">
                    <div class="input-group">
                        <span class="input-group-addon"><path:i18n group="workflow" key="nodeName" /></span>
                        <input class="form-control" type="text" maxlength="50" name="nodeName" />
                    </div>
                    <div class="space-2 visible-xs"></div>
                </div>
                <div class="col-xs-5 col-sm-3 no-padding-right" data-for="axis">
                    <div class="input-group">
                        <span class="input-group-btn">
                            <button data-toggle="dropdown" class="horizon-btn btn btn-default btn-sm" type="button">
                                <span></span>
                                <i class="ace-icon fa fa-angle-down bigger-130"></i>
                            </button>
                            <ul data-for="axisTypeY" class="dropdown-menu dropdown-light-blue dropdown-caret">
                                <li data-code="absolute-y">
                                    <a href="javascript:void(0);"><path:i18n group="workflow" key="absoluteY" /></a>
                                </li>
                                <li data-code="relative-top">
                                    <a href="javascript:void(0);"><path:i18n group="workflow" key="relativeTop" /></a>
                                </li>
                                <li data-code="relative-bottom">
                                    <a href="javascript:void(0);"><path:i18n group="workflow" key="relativeBottom" /></a>
                                </li>
                            </ul>
                        </span>
                        <input class="form-control" type="text" name="axisY" onkeyup="this.value=this.value.replace(/\D/g, '')"/>
                    </div>
                </div>
                <div class="col-xs-5 col-sm-3 no-padding-right" data-for="axis">
                    <div class="input-group">
                        <span class="input-group-btn">
                            <button data-toggle="dropdown" class="horizon-btn btn btn-default btn-sm" type="button">
                                <span></span>
                                <i class="ace-icon fa fa-angle-down bigger-130"></i>
                            </button>
                            <ul data-for="axisTypeX" class="dropdown-menu dropdown-light-blue dropdown-caret">
                                <li data-code="absolute-x">
                                    <a href="javascript:void(0);"><path:i18n group="workflow" key="absoluteX" /></a>
                                </li>
                                <li data-code="relative-left">
                                    <a href="javascript:void(0);"><path:i18n group="workflow" key="relativeLeft" /></a>
                                </li>
                                <li data-code="relative-right">
                                    <a href="javascript:void(0);"><path:i18n group="workflow" key="relativeRight" /></a>
                                </li>
                            </ul>
                        </span>
                        <input class="form-control" type="text" name="axisX" onkeyup="this.value=this.value.replace(/\D/g, '')"/>
                    </div>
                </div>
                <div class="col-xs-2 col-sm-1 align-right no-padding-left" data-for="axis">
                    <button type="button" title="<path:i18n group="workflow" key="selectNodePosition" />" class="horizon-btn btn btn-primary btn-sm" data-action="position">
                        <i class="ace-icon fa fa-crosshairs"></i>
                    </button>
                </div>
            </div>
            <div class="padding-10 no-padding-left no-padding-right"></div>
        </div>
        <div class="authors">
            <div class="horizon-tab">
                <ul class="tab">
                    <li class="col-xs-4 no-padding" data-type="Author">
                        <a class="width-100 center" data-toggle="not-allowed"><path:i18n group="workflow" key="author" /></a>
                    </li>
                    <li class="col-xs-4 no-padding" data-type="SecondAuthor">
                        <a class="width-100 center" data-toggle="not-allowed"><path:i18n group="workflow" key="secondAuthor" /></a>
                    </li>
                    <li class="col-xs-4 no-padding" data-type="Reader">
                        <a class="width-100 center" data-toggle="not-allowed"><path:i18n group="workflow" key="reader" /></a>
                    </li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane" data-type="Author">
                        <div class="tags row">
                            <input type="hidden" name="id"/>
                            <input type="hidden" name="name"/>
                        </div>
                    </div>
                    <div class="tab-pane" data-type="SecondAuthor">
                        <div class="tags row">
                            <input type="hidden" name="id"/>
                            <input type="hidden" name="name"/>
                        </div>
                    </div>
                    <div class="tab-pane" data-type="Reader">
                        <div class="tags row">
                            <input type="hidden" name="id"/>
                            <input type="hidden" name="name"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row no-margin">
                <div class="col-xs-6 col-sm-3 col-md-2 no-padding timeLimit-container"></div>
                <div class="col-xs-6 col-sm-9 col-md-10 no-padding-right align-right">
                    <button disabled="disabled" class="horizon-btn btn btn-primary btn-sm" type="button" data-action="selectuser">
                        <i class="ace-icon fa fa-users"></i> <path:i18n group="workflow" key="selectUser" />
                    </button>
                </div>
            </div>
        </div>
        <div class="timeLimit-group input-group">
            <input tabindex="-1" name="timeLimit" class="input-sm form-control" onkeyup="this.value=this.value.replace(/\D/g, '')" onblur="this.value=this.value.replace(/\D/g, '')" type="text">
            <span class="input-group-btn dropup">
                <button data-toggle="dropdown" class="timeLimitBtn horizon-btn btn btn-default btn-sm" type="button">
                    <span><path:i18n group="workflow" key="workday" /></span>
                    <i class="ace-icon fa fa-angle-down bigger-130"></i>
                </button>
                <ul class="dropdown-menu dropdown-light-blue dropdown-menu-right dropdown-caret">
                    <li data-code="0" class="active">
                        <a href="javascript:void(0);"><path:i18n group="workflow" key="workday" /></a>
                    </li>
                    <li data-code="1">
                        <a href="javascript:void(0);"><path:i18n group="workflow" key="day" /></a>
                    </li>
                    <!-- 小时
                    <li data-code="2">
                        <a href="javascript:void(0);"><path:i18n group="workflow" key="hour" /></a>
                    </li>
                    -->
                </ul>
            </span>
        </div>
        <div class="subwork-list hidden"></div>
        <div class="msg-type" data-msg-type="<path:prop name="workflow.messageType"/>">
            <label>
                <input name="messageType" type="checkbox" class="ace" value="Mail"/>
                <span class="lbl"> <path:i18n group="workflow" key="mail" /> </span>
            </label>
            <label>
                <input name="messageType" type="checkbox" class="ace" value="SMS"/>
                <span class="lbl"> <path:i18n group="workflow" key="sms" /> </span>
            </label>
            <label>
                <input name="messageType" type="checkbox" class="ace" value="Msg"/>
                <span class="lbl"> <path:i18n group="workflow" key="msg" /> </span>
            </label>
            <label>
                <input name="messageType" type="checkbox" class="ace" value="IM"/>
                <span class="lbl"> <path:i18n group="workflow" key="im" /> </span>
            </label>
        </div>
        <div class="help-block red clearfix"></div>
	</div>
    <button type="button" class="hidden" id="focus">focus</button>

    <script data-main="<path:assetsPath/>/module/workflow/js/horizon.workflow" src="<path:frontPath/>/require/require.js"></script>
</c:otherwise>
</c:choose>
</body>
</html>
