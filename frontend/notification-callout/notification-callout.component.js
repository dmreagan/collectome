angular
  .module('notificationCallout')
  .component('notificationCallout', {
    templateUrl: 'notification-callout/notification-callout.template.html',
    bindings: {
      kind: '@',
      message: '@',
      confirm: '@',
      url: '@',
    },
    controller: function notificationCalloutController() {
      const ctrl = this;

      const styles = {
        plain: '',
        regular: 'primary',
        neutral: 'secondary',
        success: 'success',
        warn: 'warning',
        error: 'alert',
      };

      ctrl.$onInit = () => {
        ctrl.style = styles[ctrl.kind];
      };
    },
  });
