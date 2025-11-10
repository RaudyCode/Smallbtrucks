# 🔐 Configuración de Google Sign-In

Para configurar Google Sign-In en tu aplicación:

## 1. Configurar Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `smallbtrucks-a2673`
3. Ve a **Authentication** → **Sign-in method**
4. Habilita **Google** como proveedor
5. Configura el **support email**

## 2. Obtener Web Client ID

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto Firebase
3. Ve a **APIs & Services** → **Credentials**
4. Busca el **OAuth 2.0 Client ID** de tipo **Web application**
5. Copia el **Client ID** (termina en `.apps.googleusercontent.com`)

## 3. Actualizar authService.js

Reemplaza `'your-web-client-id'` en `authService.js` línea 15:

```javascript
GoogleSignin.configure({
  webClientId: '687559260753-TU_WEB_CLIENT_ID_AQUI.apps.googleusercontent.com',
});
```

## 4. Configurar Android (app.json)

Agrega esta configuración a `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.687559260753-TU_CLIENT_ID"
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./android/app/google-services.json"
    }
  }
}
```

## 5. Rebuild

Después de configurar:

```bash
npx expo run:android
# o
npx expo run:ios
```

## 📝 Notas

- En desarrollo con Expo Go, Google Sign-In puede no funcionar completamente
- Para pruebas completas, usa `expo run:android` o `expo run:ios`
- El `google-services.json` ya está configurado en tu proyecto

## 🆘 Si tienes problemas

1. Verifica que el Web Client ID sea correcto
2. Asegúrate de que Google esté habilitado en Firebase Authentication
3. Revisa que `google-services.json` esté actualizado
4. Usa build de desarrollo, no Expo Go para pruebas completas