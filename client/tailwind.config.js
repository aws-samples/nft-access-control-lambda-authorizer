module.exports = {
  content: [
    './public/index.html',
    "./src/**/*.{html,js}"
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
        
          "primary": "#fc1461",
                  
          "secondary": "#a5f7ec",
                  
          "accent": "#dcbdfc",
                  
          "neutral": "#282F34",
                  
          "base-100": "#F1F1F3",
                  
          "info": "#387BE0",
                  
          "success": "#129158",
                  
          "warning": "#F48506",
                  
          "error": "#F75055",
        },
      },
    ],
  },
  plugins: [
    require('daisyui'),
  ]
}
