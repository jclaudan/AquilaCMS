/* Directives */

var adminCatagenDirectives = angular.module("adminCatagenDirectives", []);

adminCatagenDirectives.directive("nsAttribute", function ()
{
    return {
        restrict: "E",
        scope: {
            product: "=",
            form: "=",
            init: "="
        },
        templateUrl: "views/templates/nsAttribute.html",
        controller: [
            "$scope",
            "Trademark",
            "Supplier",
            "$filter",
            function ($scope, Trademark, Supplier)
            {
                $scope.supplier = {};
                $scope.trademarkList = Trademark.query();
                $scope.supplierList = Supplier.query();
                $scope.updateSupplierField = function ()
                {
                    $scope.supplier = Supplier.get(
                        {
                            id: $scope.product.supplier_ref
                        },
                        function (resp)
                        {
                            $scope.product.supplier_ref = resp._id;
                        }
                    );
                };
                $scope.$watch("init", function (newValue, oldValue)
                {
                    if(newValue != oldValue)
                    {
                        if(angular.isDefined($scope.product.supplier_ref))
                        {
                            $scope.supplier = Supplier.get(
                                {
                                    id: $scope.product.supplier_ref
                                },
                                function (resp)
                                {
                                    $scope.product.supplier_ref = resp._id;
                                }
                            );
                        }
                    }
                });
            }
        ]
    };
});

// Il faut donner un nom à l'élément pour que cette directive fonctionne correctement
adminCatagenDirectives.directive("nsDatepicker", function ()
{
    return {
        restrict: "E",
        templateUrl: "views/templates/nsDatepicker.html",
        require: "ngModel",
        scope: {
            ngDisabled: "=?",
            ngModel: "=",
            ngRequired: "=?"
        },
        link: function (scope, element, attrs, ngModel)
        {
            //On donne un id (censé être unique) à l'élément datepicker
            $("input", element).attr("id", "datepicker_" + attrs.name);
            ngModel.$render = function ()
            {
                if(ngModel.$modelValue)
                {
                    scope.myDate = moment(new Date(ngModel.$modelValue)).format("L");
                }
            };
            scope.onDateChange = function ()
            {
                if(
                    scope.myDate &&
                    moment(scope.myDate, "DD/MM/YYYY").isValid()
                )
                {
                    var dateElement = $("#datepicker_" + attrs.name, element);
                    ngModel.$setViewValue(dateElement.datepicker("getDate"));
                    dateElement.datepicker("refresh");
                    $("#datepicker_" + attrs.name, element).removeClass(
                        "invalid"
                    );
                }
                else
                {
                    if(attrs.empty == 'true'){
                        var dateElement = $("#datepicker_" + attrs.name, element);
                        ngModel.$setViewValue("");
                        dateElement.datepicker("refresh");
                    }else{
                        $("#datepicker_" + attrs.name, element).addClass("invalid");
                    }
                }
            };
            if(attrs.required)
            {
                scope.ngRequired = true;
            }
            if(attrs.disabled)
            {
                scope.ngDisabled = true;
            }

            $("#datepicker_" + attrs.name, element).datepicker({
                changeMonth: true,
                changeYear: true,
                showWeek: true,
                firstDay: 1,
                showOtherMonths: true,
                selectOtherMonths: true,
                showButtonPanel: true,
                onSelect: function (dateText)
                {
                    scope.myDate = dateText
                    scope.$apply(function () {
                        ngModel.$setViewValue(
                            moment(dateText, "DD/MM/YYYY").toDate()
                        );
                    });
                }
            });
        }
    };
});

adminCatagenDirectives.directive("nsSwitch", [
    "$translate", function ($translate)
    {
        return {
            restrict: "E",
            templateUrl: "views/templates/nsSwitch.html",
            require: "ngModel",
            scope: {
                isActive: "=?"
            },
            link: function (scope, element, attrs, ngModel)
            {
                scope.switchName = attrs.name;
                scope.disableSwitch = (attrs.disableSwitch === "true") || false;
                $translate("ns.switch.yes").then(function (yes)
                {
                    scope.yes_value = attrs.yesValue || yes;
                });
                $translate("ns.switch.no").then(function (no)
                {
                    scope.no_value = attrs.noValue || no;
                });

                ngModel.$render = function ()
                {
                    if(ngModel.$modelValue === true || ngModel.$modelValue === "true")
                    {
                        scope.switchValue = true;
                    }
                    else
                    {
                        scope.switchValue = false;
                    }
                };
                scope.onSwitchChange = function (newVal)
                {
                    ngModel.$setViewValue(newVal);
                };
                if(scope.isActive !== undefined)
                {
                    scope.switchValue = scope.isActive;
                    scope.onSwitchChange(scope.isActive);
                }
            }
        }
    }
]);

adminCatagenDirectives.directive("nsTinymce", function ($timeout) {
    return {
        restrict: "E",
        scope: {
            text: "="
        },
        templateUrl: "views/templates/nsTinymce.html",
        controller: [
            "$scope", "$filter", "Product", "Trademark", "Supplier", "$modal",
            function ($scope, $filter, Product, Trademark, Supplier, $modal) {

                $scope.tinymceOptions = {
                        // entities: '160,nbsp,38,amp,60,lt,62,gt',
                        // paste_auto_cleanup_on_paste: false,
                        // entity_encoding: "raw",
                        // apply_source_formatting : false,
                        entity_encoding: "named",
                        branding: false,
                        forced_root_block: false,
                        relative_urls: false,
                        selector: '#editor',
                        plugins: 'code, fullscreen, preview, link',
                        valid_elements: "*[*]",
                        valid_children : "+body[style|link]",
                        content_style: "ns-accordion, ns-block-slider, ns-blog-articles, ns-breadcrumb, ns-btn, ns-cart-count, ns-cms, ns-contact, ns-product-card-list, ns-gallery, ns-top-button, ns-lang, ns-link, ns-login, ns-newsletter, ns-menu, ns-productcard, ns-search, ns-slider {border:1px solid #CCC;padding:3px;background-color:#576fa1}"
                            + "ns-accordion:before{content:'ns-accordion'}"
                            + "ns-block-slider:before{content:'ns-block-slider'}"
                            + "ns-blog-articles:before{content:'ns-blog-articles'}"
                            + "ns-breadcrumb:before{content:'ns-breadcrumb'}"
                            + "ns-btn:before{content:'ns-btn'}"
                            + "ns-cart-count:before{content:'ns-cart-count'}"
                            + "ns-cms:before{content:'ns-cms'}"
                            + "ns-contact:before{content:'ns-contact'}"
                            + "ns-product-card-list:before{content:'ns-product-card-list'}"
                            + "ns-gallery:before{content:'ns-gallery'}"
                            + "ns-top-button:before{content:'ns-top-button'}"
                            + "ns-lang:before{content:'ns-lang'}"
                            + "ns-link:before{content:'ns-link'}"
                            + "ns-login:before{content:'ns-login'}"
                            + "ns-newsletter:before{content:'ns-newsletter'}"
                            + "ns-menu:before{content:'ns-menu'}"
                            + "ns-productcard:before{content:'ns-productcard'}"
                            + "ns-search:before{content:'ns-search'}"
                            + "ns-slider:before{content:'ns-slider'}"
                        ,
                        toolbar: 'undo redo | bold italic underline forecolor fontsizeselect removeformat | alignleft aligncenter alignright | link unlink | customAddImg | fullscreen preview | code',
                        fontsize_formats: '8px 10px 12px 14px 16px, 20px',
                        menubar: false,
                        statusbar: false,
                        setup: function (editor) {
                            editor.ui.registry.addButton('customAddImg', {
                                //text: 'Ajouter une image',
                                icon: "gallery",
                                tooltip: 'Gallery',
                                onAction: function () {
                                    $scope.addImage();
                                }
                            });
                        }
                    };

                    $scope.addImage = function () {
                        const modalInstance = $modal.open({
                            backdrop: 'static',
                            keyboard: false,
                            templateUrl: 'views/modals/add-image-tinymce.html',
                            controller: ['$scope', '$location', '$modalInstance', "MediaApi","toastService",
                            function ($scope, $location, $modalInstance, MediaApi, toastService) {
                                // $scope.parents = $scope.getParentsList(familyType);
                                MediaApi.list(function (response) {
                                    $scope.medias = response;
                                });

                                $scope.size = {};
                                $scope.size.max = true;

                                $scope.changeSwitch = function(){
                                    if ($scope.size.max === true){
                                        $scope.size.max = false;
                                    }else{
                                        $scope.size.max = true;
                                    }
                                }

                                $scope.link = "url.png";

                                $scope.selectImage = function(image){
                                    $scope.imageId = image._id;
                                    $scope.imageSelected = image.link;
                                };

                                $scope.ok = function () {
                                    let url = $scope.imageSelected.split('medias/')[1];
                                    if($scope.size.max){
                                        url = '/images/medias/' + 'max-80/' + $scope.imageId + "/" + url;
                                    }else{
                                        url = '/images/medias/' + $scope.size.width + 'x' + $scope.size.height + '-80/' + $scope.imageId + "/" + url;
                                    }
                                    // url =
                                    $modalInstance.close(url);
                                };

                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                };

                            }],
                            resolve: {
                            }
                        });

                        modalInstance.result.then(function (url) {
                            tinyMCE.activeEditor.selection.setContent('<img src="' + url + '"/>');
                            // tinyMCE.activeEditor.setContent(tinymce.activeEditor.getContent());
                            // $scope.product.translation[lang].description2.text =  tinymce.activeEditor.getContent();
                        });
                    };
            }
        ]
    };
});
adminCatagenDirectives.directive("nsFileDrop", function ()
{
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "views/templates/nsFileDrop.html"
    };
});

adminCatagenDirectives.directive("nsReturnButton", function ()
{
    return {
        restrict: "E",
        scope: {
            returnPath: "@",
            form: "="
        },
        templateUrl: "views/templates/nsReturnButton.html",
        controller: [
            "$scope",
            "$location",
            function ($scope, $location)
            {
                $scope.return = function ()
                {
                    if($scope.form.$dirty)
                    {
                        if(
                            confirm(
                                "Les modifications non sauvegardées seront perdues.\nEtes-vous sûr de vouloir quitter cette page ?"
                            )
                        )
                        {
                            $location.path($scope.returnPath);
                        }
                    }
                    else
                    {
                        $location.path($scope.returnPath);
                    }
                };

                $scope.$watch("form.$submitted", function (newValue)
                {

                    if(newValue)
                    {
                        $scope.form.$setPristine();
                    }
                });
            }
        ]
    };
});

adminCatagenDirectives.directive("nsButtons", function ()
{
    return {
        restrict: "E",
        transclude: true,
        scope: {
            returnPath: "@?",
            hideReturn: "=",
            form: "=?",
            remove: "&remove",
            saveAndQuit: "&saveAndQuit",
            hideSaveAndQuit: "=",
            duplicateProduct: "&?",
            disableSave: "=?",
            isEditMode: "=",
            hideRemove: "=", //Si on est en Edit Mode mais qu'on ne veut pas la suppresion pour autant (par exemple sur un ou plusieurs éléments)
            onLoad: "&?"
        },
        templateUrl: "views/templates/nsButtons.html",
        link: function (scope)
        {
            if(scope.onLoad)
            {
                scope.onLoad();
            }
        }
    };
});

adminCatagenDirectives.directive("nsCmsBlocks", function ()
{
    return {
        restrict: "E",
        scope: {
            product: "=",
            form: "="
        },
        templateUrl: "views/templates/nsCmsBlocks.html"
    };
});

adminCatagenDirectives.directive("nsBox", function ()
{
    return {
        restrict: "E",
        transclude: true,
        scope: {
            translateValues: "=",
            title: "@",
            stick: "@",
            titleIcon: "@?",
            closeHref: "@?",
            closeClick: "&?",
            addHref: "@?",
            addClick: "&?",
            editHref: "@?",
            editClick: "&?",
            newHref: "@?",
            newClick: "&?"
        },
        templateUrl: "views/templates/nsBox.html",
        link: function (scope, element, attrs)
        {
            $("ns-box")
                .parent()
                .parent()
                .addClass("boxShrink");
            scope.hasAdd = attrs.addHref || attrs.addClick;
            scope.hasClose = attrs.closeHref || attrs.closeClick;
            scope.hasNew = attrs.newHref || attrs.newClick;
            scope.hasEdit = attrs.editHref || attrs.editClick;
        }
    };
});
adminCatagenDirectives.directive("numericbinding", function ()
{
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            model: "=ngModel"
        },
        link: function (scope, element, attrs, ngModelCtrl)
        {
            if(scope.model && typeof scope.model == "string")
            {
                scope.model = parseInt(scope.model);
            }
        }
    };
});
adminCatagenDirectives.directive("nsAttributes", function ($compile)
{
    return {
        template: "<label for='{{ att.translation[lang].name }}' class='col-sm-2 control-label'>{{ att.translation[lang].name }}</label>",
        restrict: "E",
        link: function (scope, element, attrs)
        {
            var el = angular.element("<span/>");
            scope.optionColor = {
                format: "hexString",
                required: false,
                allowEmpty: true
            }
            switch(scope.att.type)
            {
                case "date":
                case "Date":
                    el.append("<div class='col-sm-10'><ns-datepicker name='value' ng-model='att.translation[lang].value'></ns-datepicker></div>");
                    break;
                case "textfield":
                case "Champ texte":
                    el.append("<div class='col-sm-10'><input class='form-control' type='text' ng-model='att.translation[lang].value'/></div>");
                    break;
                case "number":
                case "Nombre":
                    if(scope.att.param == "Non") {
                        el.append("<div class='col-sm-10'><input class='form-control' numericbinding type='number' ng-model='att.translation[lang].value'/></div>");
                    } else if (scope.att.param == "Oui") {
                        el.append("<div class='col-sm-10'><input class='form-control' numericbinding type='number' ng-model='att.translation[lang].value'/><span>La valeur entrée dans ce champ sera la valeur par défaut lors de la séléction par l'utilisateur</span></div>");
                    }
                    break;
                case "textarea":
                case "Zone de texte":
                    el.append("<div class='col-sm-10'><div class='tinyeditor-small'><ns-tinymce text='att.translation[lang].value'></ns-tinymce></div></div>");
                    break;
                case "bool":
                case "Booléen (oui/non)":
                    el.append("<div class='col-sm-10'><label><ns-switch name='{{att.code}}' ng-model='att.translation[lang].value'></ns-switch></div>");
                    break;
                case "list":
                case "Liste déroulante":
                    el.append("<div class='col-sm-10'>" +
                        "    <select class='form-control' ng-model='att.translation[lang].value'>" +
                        "        <option value='' disabled>Choix dans la liste déroulante</option>" +
                        "        <option ng-repeat='value in att.translation[lang].values' value='{{value}}'>{{value}}</option>" +
                        "    </select>" +
                        "</div>");
                    break;
                case "multiselect":
                case "Sélection multiple":
                    el.append("<div class='col-sm-10'>" +
                        "    <select class='form-control' ng-model='att.translation[lang].value' size='10' multiple>" +
                        "        <option value='' disabled>Choix dans la liste</option>" +
                        "        <option ng-repeat='value in att.translation[lang].values' value='{{value}}'>{{value}}</option>" +
                        "    </select>" +
                        "</div>");
                    break;
                case "interval":
                case "Intervalle":
                    el.append("<div class='col-sm-10'>" +
                        "    <span class='col-sm-offset-1 col-sm-2'>Minimum</span>" +
                        "    <div class='col-sm-1'>" +
                        "        <input name='min' class='form-control' numericbinding type='number' max='{{att.translation[lang].max}}' ng-model='att.translation[lang].min' />" +
                        "    </div>" +
                        "    <span class='col-sm-offset-1 col-sm-2'>Maximum</span>" +
                        "    <div class='col-sm-1'>" +
                        "        <input name='max' class='form-control' numericbinding type='number' min='{{att.translation[lang].min}}' ng-model='att.translation[lang].max' />" +
                        "    </div>" +
                        "</div>");
                    break;
                case "doc/pdf":
                case "Fichier PDF":
                    el.append(
                        "<div class='col-sm-2' style='margin-top: 3px;'><input readonly type='text' class='form-control' ng-model='att.translation[lang].value'></div><div class='col-sm-2'><a target='_blank' href='{{ att.translation[lang].value }}' class='btn btn-info' ng-show='att.translation[lang].value != null'>Afficher le PDF</a></div>" +
                        "<div class=\"col-sm-5\"><ns-upload-files lang=\"lang\" style-prop=\"{height: '35px', margin: '0px 0px 12px 0px'}\" accepttype=\"application/pdf\" multiple=\"false\" code=\"att.id\" type=\"attribute\" id=\"product._id\" entity=\"att.translation[lang]\"></ns-upload-files></div>" +
                        "<div class=\"col-sm-1\"><button type=\"button\" class=\"btn btn-danger\" ng-click=\"removeImage(att.translation[lang].value); att.translation[lang].value = null\" style=\"min-width: 10px; float: right;\"><i class=\"fa fa-trash\"/></div>");
                    break;
                case "image":
                case "Image":
                    el.append(
                        '<div class="col-sm-2" style="margin-top: 3px;"><input readonly type="text" class="form-control" ng-model="att.translation[lang].value"></div><div class="col-sm-2"><a title="Image" data-trigger="hover" data-placement="bottom" data-html="true" data-toggle="popover" data-content="<img src=\'{{ att.translation[lang].value }}\' width=\'250\' height=\'200\'>" class="btn btn-info" ng-show="att.translation[lang].value != null">Afficher l\'image</a></div>' +
                        '<div class="col-sm-5"><ns-upload-files lang="lang" style-prop="{height: \'35px\', margin: \'0px 0px 12px 0px\'}" accepttype="image/*" multiple="false" code="att.id" type="attribute" id="product._id" entity="att.translation[lang]"></ns-upload-files></div>' +
                        '<div class="col-sm-1"><button type="button" class="btn btn-danger" ng-click="removeImage(att.translation[lang].value); att.translation[lang].value = null" style="min-width: 10px; float: right;"><i class="fa fa-trash"/></div>'
                    );
                    break;
                case "video":
                case "Vidéo":
                    el.append(
                        '<div class="col-sm-2" style="margin-top: 3px;"><input readonly type="text" class="form-control" ng-model="att.translation[lang].value"></div><div class="col-sm-2 popVideo"><a title="Vidéo" data-placement="bottom" data-html="true" data-toggle="popover" data-content="<video width=\'800\' controls><source src=\'{{ att.translation[lang].value }}\'>Votre navigateur ne supporte pas les vidéos HTML5.</video>" class="btn btn-info" ng-show="att.translation[lang].value != null">Afficher la vidéo</a></div>' +
                        '<div class="col-sm-5"><ns-upload-files lang="lang" style-prop="{height: \'35px\', margin: \'0px 0px 12px 0px\'}" accepttype="video/*" multiple="false" code="att.id" type="attribute" id="product._id" entity="att.translation[lang]"></ns-upload-files></div>' +
                        '<div class="col-sm-1"><button type="button" class="btn btn-danger" ng-click="removeImage(att.translation[lang].value); att.translation[lang].value = null" style="min-width: 10px; float: right;"><i class="fa fa-trash"/></div>');
                    break;
                case "color":
                case "Couleur":
                    el.append("<div class=\"col-sm-10\" style=\"display: flex\">"+
                            "<color-picker ng-model=\"att.translation[lang].value\" options=\"optionColor\"></color-picker>"+
                            "<button style=\"height: 20px; padding: 0 5px;\" ng-click=\"att.translation[lang].value = ''\" type=\"button\"><i class=\"fa fa-times\"/></button>"+
                        "</div>"
                    );
                    break;
            }
            $compile(el)(scope);
            element.append(el);
        }
    };
});

adminCatagenDirectives.directive("nsOptions", function ($compile)
{
    return {
        template: "",
        restrict: "E",
        link: function (scope, element, attrs)
        {
            var el = angular.element("<span/>");
            switch(scope.line.type)
            {
                case "Texte Court":
                    el.append(
                        "<input class='form-control' type='text' ng-model='value[line.name]'/>"
                    );
                    break;
                case "number":
                case "Nombre":
                    el.append(
                        "<input class='form-control' numericbinding type='number' ng-model='value[line.name]'/>"
                    );
                    break;
                case "Texte Long":
                    el.append(
                        "<textarea ng-model='value[line.name]' rows='3' style=' font-size: 14px; width: 100%;'></textarea>"
                    );
                    break;
                case "image":
                case "Image":
                    scope.lineIndex = attrs.index;
                    el.append(
                        '<div class="col-sm-4"><input readonly type="text" class="form-control" ng-model="value[line.name]"></div><div class="col-sm-1"><a title="Image" data-trigger="hover" data-placement="top" data-html="true" data-toggle="popover" data-content="<img src=\'{{ value[line.name] }}\' width=\'250\' height=\'200\'>" class="btn btn-info" ng-show="value[line.name] != null">Afficher</a></div>' +
                        '<div class="col-sm-6"><ns-upload-files style-prop="{height: \'35px\', margin: \'0px 0px 15px 0px\'}" accepttype="image/*" multiple="false" code="opt.code" type="option" id="opt._id" entity="{value: value, lineIndex: lineIndex, line: line.name, values: opt.values}"></ns-upload-files></div>' +
                        '<div class="col-sm-1"><button type="button" class="btn btn-danger" ng-click="value[line.name] = null" style="min-width: 10px; float: right;"><i class="fa fa-trash-o"/></div>'
                    );
                    break;
            }
            $compile(el)(scope);
            element.append(el);
        }
    };
});

adminCatagenDirectives.directive("toggle", function ()
{
    return {
        restrict: "A",
        link: function (scope, element, attrs)
        {
            if(attrs.toggle == "tooltip")
            {
                $(element).tooltip();
            }
            if(attrs.toggle == "popover")
            {
                $(element).popover();
            }
        }
    };
});
adminCatagenDirectives.directive("popoverNs", function ($compile, $timeout)
{
    return {
        restrict: "A",
        link: function (scope, el, attrs)
        {
            var content = attrs.content;
            var elm = angular.element("<div />");
            elm.append(attrs.content);
            $compile(elm)(scope);
            $timeout(function ()
            {
                el.removeAttr("popover-ns").attr("data-content", elm.html());
                el.popover();
            }, 100);
        }
    };
});

adminCatagenDirectives.directive("nsStatusLabel", function ()
{
    return {
        restrict: "E",
        templateUrl: "views/templates/nsStatusLabel.html",
        scope: {
            type: "@",
            status: "="
        },
        controller: [
            "$scope",
            "$filter",
            "$rootScope",
            function ($scope, $filter, $rootScope)
            {
                $scope.statusObj = {};
                if($scope.type === "order")
                {
                    $scope.statusObj.isSuccess =
                        $scope.status === "PAID" ||
                        $scope.status === "PROCESSED" ||
                        $scope.status === "BILLED" ||
                        $scope.status === "FINISHED";
                    $scope.statusObj.isWarning =
                        $scope.status === "PAYMENT_PENDING" ||
                        $scope.status === "PAYMENT_CONFIRMATION_PENDING" ||
                        $scope.status === "PROCESSING" ||
                        $scope.status === "ASK_CANCEL" ||
                        $scope.status === "DELIVERY_PARTIAL_PROGRESS";
                    $scope.statusObj.isDanger =
                        $scope.status === "CANCELED" ||
                        $scope.status === "CANCELING" ||
                        $scope.status === "RETURNED";
                    $scope.statusObj.isBlue =
                        $scope.status === "DELIVERY_PROGRESS";
                    $scope.statusObj.isYellow =
                        $scope.status === "PAYMENT_RECEIPT_PENDING";
                    $scope.statusObj.name = $filter("orderStatus")($scope.status, $rootScope.adminLang);
                }
                else if($scope.type === "paymentStatus")
                {
                    $scope.statusObj.isSuccess =
                        $scope.status === "DONE";
                    $scope.statusObj.isWarning =
                        $scope.status === "TODO";
                    $scope.statusObj.isDanger =
                        $scope.status === "CANCELED" ||
                        $scope.status === "FAILED";
                    $scope.statusObj.name = $filter("paymentStatus")($scope.status);
                }
                else if($scope.type === "paymentType")
                {
                    $scope.statusObj.isSuccess =
                        $scope.status === "CREDIT";
                    $scope.statusObj.isDanger =
                        $scope.status === "DEBIT";
                    $scope.statusObj.name = $scope.status;
                }
                else if($scope.type === "picto")
                {
                    $scope.statusObj.isSuccess = $scope.status === true;
                    $scope.statusObj.isWarning = false;
                    $scope.statusObj.isDanger = $scope.status === false;
                    $scope.statusObj.name = $scope.status
                        ? "Visible"
                        : "Non visible";
                }
                else if ($scope.type === "category") {
                    $scope.statusObj.isSuccess = $scope.status === true;
                    $scope.statusObj.isWarning = false;
                    $scope.statusObj.isDanger = $scope.status === false;
                    $scope.statusObj.name = $scope.status
                        ? "Visible"
                        : "Non visible";
                }
            }
        ]
    };
});

adminCatagenDirectives.directive("nsTimeInput", function ()
{
    return {
        restrict: "E",
        require: "ngModel",
        scope: {
            stepMinutes: "=?"
        },
        templateUrl: "views/templates/nsTimeInput.html",
        link: function (scope, element, attrs, ngModel)
        {
            ngModel.$render = function ()
            {
                if(ngModel.$modelValue)
                {
                    var time = ngModel.$modelValue.split("h");
                    scope.time.hours = time[0];
                    scope.time.minutes = time[1];
                }
            };

            scope.time = {
                hours: "",
                minutes: ""
            };

            var allHours = [];
            for(var i = 0; i < 24; i++)
            {
                allHours.push(i + "");
            }
            var allMinutes = [];
            for(var i = 0; i < 59; i = i + scope.stepMinutes)
            {
                if(i < 10)
                {
                    allMinutes.push("0" + i);
                }
                else
                {
                    allMinutes.push(i + "");
                }
            }
            scope.allHours = allHours;
            scope.allMinutes = allMinutes;

            scope.onTimeChange = function ()
            {
                if(scope.time.hours && scope.time.minutes)
                {
                    ngModel.$setViewValue(
                        scope.time.hours + "h" + scope.time.minutes
                    );
                }
                else
                {
                    ngModel.$setViewValue(null);
                }
            };
        },
        controller: [
            "$scope", function ($scope)
            {
            }
        ]
    };
});

adminCatagenDirectives
    .constant("nsDataTableConfig", {
        tables: {}
    })
    .controller("nsDataTableCtrl", [
        "$scope",
        "$filter",
        function ($scope, $filter)
        {
            $scope.sort = {
                type: $scope.config.columns[0].field,
                reverse: true
            };

            $scope.filter = {};

            $scope.itemsPerPage = $scope.config.pagination.itemsPerPage || 12;
            $scope.maxSize = $scope.config.pagination.maxSize || 5;
            $scope.columns = $scope.config.columns;

            if($scope.config.pagination.serverPaging)
            {
                $scope.onPageChange = function (page)
                {
                    $scope.config.sourceData
                        .read(
                            page,
                            $scope.itemsPerPage,
                            $scope.filter,
                            $scope.sort
                        )
                        .then(function (result)
                        {
                            $scope.items =
                                result[$scope.config.sourceData.dataField];
                            $scope.totalItems =
                                result[$scope.config.sourceData.totalField];
                            $scope.currentPage = page;
                        });
                };
                $scope.onPageChange(1);
            }
            else
            {
                var allItems;
                $scope.config.sourceData.read().then(function (items)
                {
                    allItems = items;
                    $scope.totalItems = items.length;
                    $scope.onPageChange(1);
                });
                $scope.onPageChange = function (page)
                {
                    $scope.currentPage = page;
                    executeSort();
                    $scope.items = allItems.slice(
                        (page - 1) * $scope.itemsPerPage,
                        page * $scope.itemsPerPage
                    );
                };

                function executeSort()
                {
                    if(!$scope.config.pagination.serverPaging)
                    {
                        if(!$scope.sort.reverse)
                        {
                            allItems.sort(function (item1, item2)
                            {
                                var a = item1[$scope.sort.type];
                                var b = item2[$scope.sort.type];
                                if(a > b)
                                {
                                    return -1;
                                }
                                if(a < b)
                                {
                                    return 1;
                                }
                                return 0;
                            });
                        }
                        else
                        {
                            allItems.sort(function (item1, item2)
                            {
                                var a = item1[$scope.sort.type];
                                var b = item2[$scope.sort.type];
                                if(a > b)
                                {
                                    return 1;
                                }
                                if(a < b)
                                {
                                    return -1;
                                }
                                return 0;
                            });
                        }
                    }
                }
            }

            $scope.checkFormat = function (value, column)
            {
                if(column.format === "image")
                {
                    return column.format;
                }
                else if(column.format !== undefined)
                {
                    return "custom_format";
                }
                else if(value === true || value === false)
                {
                    return "bool";
                }
                else if(angular.isDate(value))
                {
                    return "date";
                }
                else
                {
                    return null;
                }
            };

            $scope.executeFormat = function (value, formatName)
            {
                return $filter(formatName)([value]);
            };

            $scope.hasEdit = $scope.config.edit !== undefined;

            $scope.hasRemove = $scope.config.remove !== undefined;

            $scope.hasActions = $scope.hasEdit || $scope.hasRemove;

            $scope.removeElmt = function (element)
            {
                if(
                    confirm("Etes-vous sûr de vouloir supprimer cet élément ?")
                )
                {
                    $scope.config.remove(element).then(function ()
                    {
                        $scope.items.splice($scope.items.indexOf(element), 1);
                        if(allItems !== undefined)
                        {
                            allItems.splice(allItems.indexOf(element), 1);
                            $scope.onPageChange($scope.currentPage);
                            $scope.totalItems--;
                        }
                    });
                }
            };

            this.addColumns = function (columns)
            {
            };

            this.removeColumns = function (columns)
            {
            };
        }
    ])
    .directive("nsDataTable", [
        "nsDataTableConfig",
        function (nsDataTableConfig)
        {
            return {
                restrict: "E",
                controller: "nsDataTableCtrl",
                scope: {
                    config: "="
                },
                templateUrl: "views/templates/nsDataTable.html",
                link: function (scope, elmt, attrs, controller)
                {
                    if(attrs.id)
                    {
                        nsDataTableConfig.tables[attrs.id] = controller;
                    }
                }
            };
        }
    ]);

adminCatagenDirectives.directive("nsDrag", [
    "$rootScope",
    function ($rootScope)
    {
        return {
            restrict: "A",
            link: function (scope, element, attrs)
            {
                attrs.$set("draggable", "true");
                scope.dragData = scope[attrs["nsDrag"]];
                element.bind("dragstart", function (evt)
                {
                    $rootScope.draggedElement = scope.dragData;
                    element.addClass("dragging");

                    if(evt.dataTransfer)
                    {
                        evt.dataTransfer.setData("id", evt.target.id);
                        evt.dataTransfer.effectAllowed = "move";
                    }
                    else
                    {
                        evt.originalEvent.dataTransfer.setData(
                            "id",
                            evt.target.id
                        );
                        evt.originalEvent.dataTransfer.effectAllowed = "move";
                    }
                });
                element.bind("dragend", function ()
                {
                    element.removeClass("dragging");
                });
            }
        };
    }
]);

adminCatagenDirectives.directive("noFloat", function ()
{
    return {
        restrict: "A",
        link: function (scope, elm, attrs, ctrl)
        {
            elm.on("keydown", function (event)
            {
                if([110, 190, 188].indexOf(event.which) > -1)
                {
                    event.preventDefault();
                    return false;
                }
                else
                {
                    return true;
                }
            });
        }
    };
});

adminCatagenDirectives.directive("nsDrop", [
    "$rootScope",
    function ($rootScope)
    {
        return {
            restrict: "A",
            link: function (scope, element, attrs)
            {
                scope.dropData = scope[attrs["nsDrop"]];
                scope.dropStyle = attrs["dropstyle"];
                element.bind("dragenter", function (evt)
                {
                    evt.preventDefault();
                    element.addClass(scope.dropStyle);
                });
                element.bind("dragleave", function (evt)
                {
                    element.removeClass(scope.dropStyle);
                });
                element.bind("dragover", function (evt)
                {
                    evt.preventDefault();
                });
                element.bind("drop", function (evt)
                {
                    evt.preventDefault();
                    element.removeClass(scope.dropStyle);
                    $rootScope.$broadcast(
                        "dropEvent",
                        $rootScope.draggedElement,
                        scope.dropData
                    );
                });
            }
        };
    }
]);

adminCatagenDirectives.directive("nsRules", [
    function ()
    {
        return {
            restrict: "E",
            scope: {
                rule: "=",
                type: "@",
                typePromo: "=",
                condType: "@"
            },
            templateUrl: "views/templates/nsRules.html",
            controller: [
                "$scope", function ($scope)
                {
                    $scope.rule.owner_type = $scope.type;
                }
            ]
        };
    }
]);

adminCatagenDirectives.directive("nsRule", [
    function ()
    {
        return {
            restrict: "E",
            templateUrl: "views/templates/nsRule.html",
            scope: {
                rule: "=",
                typePromo: "=",
                removable: "=",
                removeFromParent: "&",
                isCart: "=",
                condType: "="
            },
            replace: true,
            controller: function ($scope, AttributesV2, FamilyV2, $modal, $element, $rootScope)
            {
                var langs = [];

                $scope.families = {};
                $scope.values = {};
                $scope.compare = [
                    {value: "contains", translate: "ns.contains"},
                    {value: "ncontains", translate: "ns.ncontains"},
                    {value: "eq", translate: "ns.eq"},
                    {value: "neq", translate: "ns.neq"},
                    {value: "startswith", translate: "ns.startswith"},
                    {value: "endswith", translate: "ns.endswith"},
                    {value: "gte", translate: "ns.gte"},
                    {value: "gt", translate: "ns.gt"},
                    {value: "lte", translate: "ns.lte"},
                    {value: "lt", translate: "ns.lt"}
                ];

                $scope.getAttributes = function ()
                {
                    $scope.attributesClassed = [];
                    AttributesV2.list({PostBody: {filter: {usedInRules: true}, structure: '*', limit: 99}}, function (response)
                    {
                        response.datas.map(function (element)
                        {
                            var type = (function (type)
                            {
                                switch(type)
                                {
                                    case "textfield":
                                    case "Champ texte":
                                        return "text";
                                    case "date":
                                    case "Date":
                                        return "date";
                                    case "number":
                                    case "Nombre":
                                        return "number";
                                    case "bool":
                                    case "Booléen (oui/non)":
                                        return "bool";
                                    case "list":
                                    case "Liste déroulante":
                                        return "select";
                                    case "multiselect":
                                    case "Sélection multiple":
                                        return "multiselect";
                                    case "interval":
                                    case "Intervalle":
                                        return "number";
                                    default:
                                        return "text";
                                }
                            })(element.type);
                            for(var i = 0, leni = langs.length; i < leni; i++)
                                {
                                    let values = [];
                                    for(var j = 0; j < Object.keys(element.translation).length; j++) {
                                        const langKey = Object.keys(element.translation)[j]
                                        values = values.concat(element.translation[langKey].values)
                                    }
                                    $scope.attributesClassed.push(
                                        {
                                            name: "attr.translation." + langs[i].code + "." + element.code,
                                            type: type,
                                            params: {
                                                values: values
                                            }
                                        }
                                    );
                                }
                        });

                        for(var i = 0, leni = langs.length; i < leni; i++)
                        {
                            $scope.attributesClassed.push(
                                {
                                    name: "translation." + langs[i].code + ".name",
                                    type: "text",
                                    params: {}
                                },
                                {
                                    name: "translation." + langs[i].code + ".slug",
                                    type: "text",
                                    params: {}
                                }
                            );
                        }

                        $scope.attributesClassed.push(
                            {
                                name: "code",
                                type: "text",
                                params: {}
                            },
                            {
                                name: "qty",
                                type: "number",
                                params: {}
                            },
                            {
                                name: "creationDate",
                                type: "date",
                                params: {}
                            },
                            {
                                name: "visible",
                                type: "bool",
                                params: {}
                            },
                            {
                                name: "active",
                                type: "bool",
                                params: {}
                            },
                            {
                                name: "price.et.normal",
                                type: "number",
                                params: {}
                            },
                            {
                                name: "price.ati.normal",
                                type: "number",
                                params: {}
                            },
                            {
                                name: "price.et.special",
                                type: "number",
                                params: {}
                            },
                            {
                                name: "price.ati.special",
                                type: "number",
                                params: {}
                            },
                            {
                                name: "type",
                                type: "text",
                                params: {}
                            },
                            {
                                name: "is_new",
                                type: "bool",
                                params: {}
                            },
                            {
                                name: "family",
                                type: "select",
                                params: {
                                    type: "family"
                                }
                            },
                            {
                                name: "subfamily",
                                type: "select",
                                params: {
                                    type: "subfamily"
                                }
                            },
                            {
                                name: "universe",
                                type: "select",
                                params: {
                                    type: "universe"
                                }
                            },
                            {
                                name: "_id",
                                type: "text",
                                params: {}
                            },
                            {
                                name: "trademark",
                                type: "text",
                                params: {}
                            },
                            {
                                name: "supplier_ref",
                                type: "text",
                                params: {}
                            },
                            {
                                name: "client.id",
                                type: "text",
                                params: {}
                            },
                            {
                                name: "client.type",
                                type: "text",
                                params: {}
                            },
                            {
                                name: "categorie.code",
                                type: "text",
                                params: {}
                            }
                        );
                        if($scope.typePromo === "1") {
                            $scope.attributesClassed.push(
                                {
                                    name: "panier.priceTotal.et",
                                    type: "number",
                                    params: {}
                                },
                                {
                                    name: "panier.priceTotal.ati",
                                    type: "number",
                                    params: {}
                                }
                            )
                        }
                        AttributesV2.list({PostBody: {filter: {_type: 'users', usedInRules: true}, structure: '*', limit: 99}}, function (response)
                        {
                            response.datas.map(function (element) {
                                var type = (function (type)
                                {
                                    switch(type)
                                    {
                                        case "textfield":
                                        case "Champ texte":
                                            return "text";
                                        case "date":
                                        case "Date":
                                            return "date";
                                        case "number":
                                        case "Nombre":
                                            return "number";
                                        case "bool":
                                        case "Booléen (oui/non)":
                                            return "bool";
                                        case "list":
                                        case "Liste déroulante":
                                            return "select";
                                        case "multiselect":
                                        case "Sélection multiple":
                                            return "multiselect";
                                        case "interval":
                                        case "Intervalle":
                                            return "number";
                                        default:
                                            return "text";
                                    }
                                })(element.type);
                                for(var i = 0, leni = langs.length; i < leni; i++)
                                {
                                    let values = [];
                                    for(var j = 0; j < Object.keys(element.translation).length; j++) {
                                        const langKey = Object.keys(element.translation)[j]
                                        values = values.concat(element.translation[langKey].values)
                                    }
                                    $scope.attributesClassed.push(
                                        {
                                            name: "client.attr.translation." + langs[i].code + "." + element.code,
                                            type: type,
                                            params: {
                                                values: values
                                            }
                                        }
                                    );
                                }
                            })
                        });

                        for(var i = 0, leni = langs.length; i < leni; i++)
                        {
                            $scope.attributesClassed.push(
                                {
                                    name: "categorie.translation." + langs[i].code + ".slug",
                                    type: "text",
                                    params: {}
                                }
                            );
                        }

                        for(var i = 0; i < $scope.rule.conditions.length; i++)
                        {
                            $scope.select($scope.rule.conditions[i].target, i, $scope.rule.conditions[i], true);
                        }
                    });
                };

                langs = $rootScope.languages;
                $scope.getAttributes();

                function newCondition()
                {
                    $scope.rule.conditions.push({});
                }

                function newRule()
                {
                    var _newRule = {conditions: [{}]};
                    if($scope.rule.other_rules === undefined)
                    {
                        $scope.rule.other_rules = [];
                    }

                    if($scope.rule.owner_type.endsWith("Action") && ($scope.rule.effects === undefined || $scope.rule.effects.length === 0))
                    {
                        _newRule.effects = [{}];
                    }

                    $scope.rule.other_rules.push(_newRule);
                }

                $scope.open = function ()
                {
                    if($scope.condType)
                    {
                        if($scope.condType === "simple")
                        {
                            newCondition();
                            if($scope.rule.owner_type.endsWith("Action") && ($scope.rule.effects === undefined || $scope.rule.effects.length === 0))
                            {
                                $scope.rule.effects = [{}];
                            }
                        }
                        else if($scope.condType === "multiple")
                        {
                            newRule();
                        }
                    }
                    else
                    {
                        $modal.open({
                            template: "<div style='text-align: center; padding: 20px;'>" +
                                "    <h2>Nouvelle condition</h2>" +
                                "    <p>Choisissez le type de condition à ajouter</p>" +
                                "    <div class='row'>" +
                                "        <button type='button' class='btn btn-danger' ng-click='cancel()'>Annuler</button>" +
                                "        <button type='button' class='btn btn-info' ng-click='newCondition()'>Simple</button>" +
                                "        <button type='button' class='btn btn-info' ng-click='newRule()'>Multiple</button>" +
                                "    </div>" +
                                "</div>", // loads the template
                            scope: $scope,
                            backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                            windowClass: "modal", // windowClass - additional CSS class(es) to be added to a modal window template
                            controller: function ($scope, $modalInstance)
                            {
                                $scope.newCondition = function ()
                                {
                                    newCondition();
                                    $scope.cancel();
                                };

                                $scope.newRule = function ()
                                {
                                    newRule();
                                    $scope.cancel();
                                };

                                $scope.cancel = function ()
                                {
                                    $modalInstance.dismiss("cancel");
                                };
                            }
                        });
                    }
                };

                $scope.removeCondition = function (index, condition)
                {
                    if(index === undefined)
                    {
                        $scope.index = -1;
                    }
                    else
                    {
                        $scope.index = index;
                    }
                    $modal.open({
                        template: "<div style='text-align: center; padding: 20px;'>" +
                            "    <h2>Supprimer la condition</h2>" +
                            "    <p>Etes vous sur de vouloir supprimer cette condition ?</p>" +
                            "    <div class='row'>" +
                            "        <button type='button' class='btn btn-danger' ng-click='cancel()'>Non</button>" +
                            "        <button type='button' class='btn btn-info' ng-click='yes()'>Oui</button" +
                            "    </div>" +
                            "</div>", // loads the template
                        scope: $scope,
                        backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                        windowClass: "modal", // windowClass - additional CSS class(es) to be added to a modal window template
                        controller: function ($scope, $modalInstance)
                        {
                            $scope.yes = function ()
                            {
                                var oCondition = $scope.rule.conditions[$scope.index];
                                // Si la condition a supprimer contient "id_parent_other_rules" alors il se peut que des other_rule soient liés a cette condition
                                if(oCondition && oCondition.id_parent_other_rules && oCondition.id_parent_other_rules === condition.id_parent_other_rules)
                                {
                                    // On cherche les other_rules liées au id_parent_other_rules de la condition afin de les supprimer
                                    if($scope.rule.other_rules && $scope.rule.other_rules.length > 0)
                                    {
                                        $scope.rule.other_rules.forEach(function (rule, index)
                                        {
                                            // Les other_rules liés a la condition on pour owner_type l'id_parent_other_rules de la condition
                                            if(rule.owner_type && rule.owner_type === condition.id_parent_other_rules)
                                            {
                                                $scope.rule.other_rules.splice(index, 1);
                                            }
                                        });
                                    }
                                }
                                $scope.rule.conditions.splice($scope.index, 1);
                                $scope.cancel();
                            };
                            $scope.cancel = function ()
                            {
                                $modalInstance.dismiss("cancel");
                            };
                        }
                    });
                };

                $scope.removeEffect = function (index)
                {
                    if(index === undefined)
                    {
                        $scope.index = -1;
                    }
                    else
                    {
                        $scope.index = index;
                    }
                    $modal.open({
                        template: "<div style='text-align: center; padding: 20px;'>" +
                            "    <h2>Supprimer l'effet</h2>" +
                            "    <p>Etes vous sur de vouloir supprimer cet effet ?</p>" +
                            "    <div class='row'>" +
                            "        <button type='button' class='btn btn-danger' ng-click='cancel()'>Non</button>" +
                            "        <button type='button' class='btn btn-info' ng-click='yes()'>Oui</button" +
                            "    </div>" +
                            "</div>", // loads the template
                        scope: $scope,
                        backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                        windowClass: "modal", // windowClass - additional CSS class(es) to be added to a modal window template
                        controller: function ($scope, $modalInstance)
                        {
                            $scope.yes = function ()
                            {
                                $scope.rule.effects.splice($scope.index, 1);
                                $scope.cancel();
                            };
                            $scope.cancel = function ()
                            {
                                $modalInstance.dismiss("cancel");
                            };
                        }
                    });
                };

                $scope.removeOtherRule = function (index, other_rule)
                {
                    if(index === undefined)
                    {
                        $scope.index = -1;
                    }
                    else
                    {
                        $scope.index = index;
                    }
                    $modal.open({
                        template: "<div style='text-align: center; padding: 20px;'>" +
                            "    <h2>Supprimer la règle</h2>" +
                            "    <p>Etes vous sur de vouloir supprimer cette regle ? La ou les condition(s) fille(s) seront supprimée(s) aussi.</p>" +
                            "    <div class='row'>" +
                            "        <button type='button' class='btn btn-danger' ng-click='cancel()'>Non</button>" +
                            "        <button type='button' class='btn btn-info' ng-click='yes()'>Oui</button" +
                            "    </div>" +
                            "</div>", // loads the template
                        scope: $scope,
                        backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
                        windowClass: "modal", // windowClass - additional CSS class(es) to be added to a modal window template
                        controller: function ($scope, $modalInstance)
                        {
                            $scope.yes = function ()
                            {
                                $scope.rule.other_rules.forEach(function (otherRule, index)
                                {
                                    if(other_rule.$$hashKey === otherRule.$$hashKey)
                                    {
                                        $scope.rule.other_rules.splice(index, 1);
                                    }
                                });
                                $scope.cancel();
                            };
                            $scope.cancel = function ()
                            {
                                $modalInstance.dismiss("cancel");
                            };
                        }
                    });
                };
                $scope.removeRule = function (index)
                {
                    $scope.removeFromParent(index);
                };
                $scope.cast = function (value)
                {
                    if(isNaN(value) === false)
                    {
                        value = Number(value);
                    }
                    return value;
                };
                /**
                 * Permet de savoir si une other_rules possède un owner_type commençant par parent_cart_
                 * @param {object} condition - une condition de type panier, on s'en servira pour afficher ses sous conditions (qui sont des other_rules)
                 * @param {object} other_rules - une other_rules d'une régle cf: voir schema models/rules.js
                 * @returns {boolean} - vrai si c'est une other_rules commençant par parent_cart_
                 */
                $scope.isCartOtherRules = function (condition)
                {
                    return function (other_rules)
                    {
                        if(other_rules && other_rules.owner_type && other_rules.owner_type === condition.id_parent_other_rules)
                        {
                            return true;
                        }
                        return false;
                    };
                };
                $scope.isNotCartOtherRules = function (other_rules = null)
                {
                    if(!other_rules || !other_rules.owner_type || !other_rules.owner_type.startsWith("parent_cart_"))
                    {
                        return true;
                    }
                    return false;
                };
                /**
                 * Permet de savoir si une condition contient des other_rules. Si c'est le cas on affichera l'other_rules directement
                 * sous la condition, on affichera les conditions suivante aprés cette other_rules
                 * @param {object} condition - une condition d'une régle cf: voir schema models/rules.js
                 * @returns {boolean} - vrai si c'est une condition contenant des sous conditions
                 */
                $scope.isCartRules = function (condition = null)
                {
                    if(condition instanceof Array)
                    {
                        console.log("condition", condition.length);
                    }
                    else if(condition && condition.id_parent_other_rules && condition.id_parent_other_rules.startsWith("parent_cart_"))
                    {
                        return true;
                    }
                    return false;
                };
                /**
                 * Permet de cacher les champs dispo dans le select en fonction de s'il est dans une condition panier ou non
                 */
                $scope.filterAttrClassedByOwnerType = function (rule)
                {
                    return function (field)
                    {
                        if(rule && rule.owner_type && rule.owner_type.startsWith("parent_cart_") && field.name.startsWith("panier.qte_min"))
                        {
                            return false;
                        }
                        return true;
                    };
                };
                $scope.select = function (target, index, condition, init)
                {
                    var attr = $scope.attributesClassed.find(function (element)
                    {
                        return element.name === target;
                    });
                    if(attr)
                    {
                        $scope.rule.conditions[index].type = attr.type === "multiselect" ? "select" : attr.type;
                        // Si on passe d'une condition 'panier.qte_min' a une condition qui n'est pas panier
                        // alors nous devons réinitialiser other_rules a []
                        var other_rules = $scope.rule.other_rules;
                        var indexToDelete = null;
                        var otherRulesFound = null;
                        if(other_rules)
                        {
                            otherRulesFound = other_rules.find(function (otherRule, idx)
                            {
                                if(otherRule.owner_type && otherRule.owner_type === condition.id_parent_other_rules)
                                {
                                    indexToDelete = idx;
                                    return true;
                                }
                                return false;
                            });
                        }
                        if(other_rules && otherRulesFound)
                        {
                            //On verifie que condition.id_parent_other_rules existe encore dans les cond.id_parent_other_rules des conditions
                            $scope.rule.conditions.forEach(function (cond)
                            {
                                if(!cond.target.startsWith("panier.qte_min") && cond.id_parent_other_rules === condition.id_parent_other_rules)
                                {
                                    delete cond.id_parent_other_rules;
                                    $scope.rule.other_rules.splice(indexToDelete, 1);
                                }
                            });
                        }

                        if(attr.type === "select" || attr.type === "multiselect")
                        {
                            if(attr.type && attr.name === attr.type)
                            {
                                FamilyV2.list({PostBody: {filter: {type: attr.type}, limit: 99, structure: '*'}}, function ({datas})
                                {
                                    $scope.families[attr.name] = datas;
                                });
                            }
                            else if(attr.params.values && attr.params.values.length > 0)
                            {
                                if(attr.type === "multiselect")
                                {
                                    $scope.rule.conditions[index].attr = "multi";
                                }
                                $scope.values[attr.name] = attr.params.values;
                            }
                        }

                        if(!!init === false)
                        {
                            $scope.rule.conditions[index].value = undefined;

                            if(attr.type === "bool")
                            {
                                $scope.rule.conditions[index].value = false;
                            }
                        }
                    }
                };

                function convertOperator (operator) {
                    switch(operator) {
                        case "Contient":
                            return "contains";
                        case "Ne contient pas":
                            return "ncontains";
                        case "Egal à":
                            return "eq";
                        case "Différent de":
                            return "neq";
                        case "Commence par":
                            return "startswith";
                        case "Fini par":
                            return "endswith";
                        case "Plus grand ou egal à":
                            return "gte";
                        case "Plus grand que":
                            return "gt";
                        case "Plus petit ou egal à":
                            return "lte";
                        case "Plus petit que":
                            return "lt";
                        default:
                            return operator;
                    }
                }

                function convertRules() {
                    if ($scope.rule && $scope.rule.conditions) {
                        for (let condition of $scope.rule.conditions) {
                            condition.operator = convertOperator(condition.operator);
                        }
                    }
                }
                convertRules();
            }
        };
    }
]);

adminCatagenDirectives.directive("nsUploadFiles", [
    function ()
    {
        return {
            restrict: "E",
            scope: {
                multiple: "=",
                type: "@",
                code: "=",
                id: "=",
                images: "=",
                entity: "=",
                showalt: '@',
                accepttype: '@',
                beforeFunction: '&',
                afterFunction: '&',
                onError: '&',
                styleProp: '=',
                lang: '='
            },
            templateUrl: "views/templates/nsUploadFiles.html",
            controller: [
                "$scope", "Upload",
                function ($scope, Upload)
                {
                    $scope.disableUpload = false;
                    $scope.idOptional = "";

                    $scope.$watch('files', function () {
                        $scope.disableUpload = true;
                        if ($scope.files && $scope.files.length) {
                            if (!$scope.multiple && $scope.files.length > 1) {
                                $scope.files.shift();
                            }

                            for (var i = 0; i < $scope.files.length; i++) {
                                $scope.files[i].default = false;
                                if ($scope.images) {
                                    if (i === 0 && $scope.images.length === 0) {
                                        $scope.files[i].default = true;
                                    }
                                }

                                $scope.files[i].extension = $scope.files[i].name.match(/\.[^/.]+$/);
                                $scope.files[i].nameModified = $scope.files[i].nameModified !== $scope.files[i].name.replace(/\.[^/.]+$/, "") && $scope.files[i].nameModified ? $scope.files[i].nameModified.replace(/[^A-Z0-9]+/ig, "_") : $scope.files[i].name.replace(/\.[^/.]+$/, "").replace(/[^A-Z0-9]+/ig, "_");
                                $scope.files[i].alt = $scope.files[i].alt !== "" ? $scope.files[i].alt : '';
                            }
                        }
                            $scope.disableUpload = false;
                    });

                    $scope.upload = function (files) {
                        $scope.disableUpload = true;
                        $scope.progress = [];
                        if (files && files.length) {
                            for (var i = 0; i < files.length; i++) {
                                var file = files[i];
                                if (!file.$error) {
                                    $scope.beforeFunction();
                                    if ($scope.type === "module"){
                                        $scope.up = Upload.upload({
                                            url: 'v2/modules/upload',
                                            method: 'POST',
                                            data: {
                                                file: file
                                            }
                                        });
                                    }
                                    else if ($scope.type === "theme"){
                                        $scope.up = Upload.upload({
                                            url: 'v2/themes/upload',
                                            method: 'POST',
                                            data: {
                                                file: file
                                            }
                                        });
                                    }
                                    else if ($scope.type === "document"){
                                        $scope.up = Upload.upload({
                                            url: '/v2/medias/download/documents',
                                            method: 'POST',
                                            data: {
                                                file: file
                                            }
                                        });
                                    }
                                    else if ($scope.type === "mediaMass"){
                                        $scope.up = Upload.upload({
                                            url: '/v2/medias/download/medias',
                                            method: 'POST',
                                            data: {
                                                file: file,
                                                insertDB: $scope.entity
                                            }
                                        });
                                    }
                                    else {
                                        if ($scope.entity) {
                                            delete $scope.entity.$promise;
                                            delete $scope.entity.$resolved;
                                        }
                                        $scope.up = Upload.upload({
                                            url: 'v2/medias/upload',
                                            method: 'POST',
                                            data: {
                                                type: $scope.type,
                                                file: Upload.rename(file, file.nameModified.replace(/[^A-Z0-9]+/ig, "_")),
                                                alt: file.alt || '',
                                                extension: file.extension[0],
                                                default: file.default,
                                                code: $scope.code ? $scope.code : '',
                                                _id: $scope.id ? $scope.id : $scope.idOptional,
                                                entity: $scope.entity,
                                                lang: $scope.lang ? $scope.lang : ''
                                            }
                                        });
                                    }
                                    $scope.up.then(function (response) {
                                        var index = $scope.files.map(function (item) {
                                            return item.nameModified.replace(/[^A-Z0-9]+/ig, "_");
                                        }).indexOf(response.data.name);
                                        $scope.files.splice(index, 1);
                                        switch ($scope.type) {
                                            case 'product': {
                                                $scope.images.push(response.data);
                                                break;
                                            }
                                            case 'picto': {
                                                $scope.entity.filename = response.data.name;
                                                break;
                                            }
                                            case 'language': {
                                                $scope.entity.img = response.data.path;
                                                break;
                                            }
                                            case 'article': {
                                                $scope.entity.img = response.data.path;
                                                break;
                                            }
                                            case 'media': {
                                                $scope.entity.link = response.data.path;
                                                $scope.entity._id = response.data.id;
                                                $scope.idOptional = response.data.id;
                                                break;
                                            }
                                            case 'gallery': {
                                                $scope.entity = response.data;
                                                $scope.images.push(response.data);
                                                $scope.afterFunction();
                                                break;
                                            }
                                            case 'slider': {
                                                $scope.images.push(response.data);
                                                $scope.afterFunction();
                                                break;
                                            }
                                            case 'module': {
                                                $scope.afterFunction({module: response.data});
                                                break;
                                            }
                                            case 'theme': {
                                                $scope.afterFunction();
                                                break;
                                            }
                                            case 'attribute': {
                                                $scope.entity.value = response.data.path;
                                                break;
                                            }
                                            case 'option': {
                                                $scope.entity.value[$scope.entity.line] = response.data.path;
                                                break;
                                            }
                                            case 'document': {
                                                $scope.afterFunction();
                                                break;
                                            }
                                            case 'mediaMass': {
                                                $scope.afterFunction();
                                                break;
                                            }
                                            case 'category': {
                                                $scope.afterFunction();
                                                break;
                                            }
                                            case 'mail': {
                                                $scope.afterFunction();
                                                break;
                                            }
                                            default:
                                                break;
                                        }
                                        $scope.disableUpload = false;
                                    }, function (err) {
                                        console.error(err);
                                        $scope.onError(err);
                                    }, function (evt) {
                                        $scope.disableUpload = true;
                                        $scope.progress[evt.config.data.file.$ngfBlobUrl] = parseInt(100.0 * evt.loaded / evt.total);
                                    }).finally(function() {
                                        $scope.disableUpload = false;
                                        $scope.progress = [];
                                    });
                                }
                            }
                            $scope.progress = [];
                        }
                    };
                }
            ]
        };
    }
]);

adminCatagenDirectives.directive('replaceComma', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            scope.$watch(attrs.ngModel, function (newVal) {
                if (newVal !== undefined && newVal !== null) {
                    ngModelCtrl.$setViewValue(String(newVal).replace(/,/g, '.'));
                    element.val(String(newVal).replace(/,/g, '.'));
                }
            })

        }
    }
});
