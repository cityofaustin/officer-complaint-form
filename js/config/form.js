import fullName from '../definitions/fullName';

const formConfig = {
  title: 'Form',
  subTitle: 'Test',
  formId: '',
  urlPrefix: '/',
  trackingPrefix: 'form-',
  transformForSubmit: '',
  submitUrl: '',
  introduction: '',
  confirmation: '',
  defaultDefinitions: {
    fullName
  },
  chapters: {
    firstSection: {
      title: 'First Section',
      pages: {
        firstPage: {
          path: 'first-section/first-page',
          title: 'First Page',
          uiSchema: {},
          schema: {
            type: 'object',
            properties: {
              fullName
            }
          }
        },
        secondPage: {
          path: 'first-section/second-page',
          title: 'Second Page',
          uiSchema: {},
          schema: {
            type: 'object',
            properties: {}
          }
        }
      }
    },
    secondSection: {
      title: 'Second Section',
      pages: {

      }
    }
  }
};

export default formConfig;