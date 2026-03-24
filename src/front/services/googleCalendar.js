const CLIENT_ID =
  "87455227187-fjc9qju55b0nalairr096t2ck72s84ek.apps.googleusercontent.com";

const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient = null;
let accessToken = null;

export function initGoogleCalendar() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 20;

    const checkGoogle = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              reject(response);
              return;
            }

            accessToken = response.access_token;
            resolve(response);
          },
        });

        resolve(true);
        return;
      }

      attempts += 1;

      if (attempts >= maxAttempts) {
        reject(new Error("Google Identity Services no cargó todavía."));
        return;
      }

      setTimeout(checkGoogle, 300);
    };

    checkGoogle();
  });
}

export function requestGoogleAccess() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google Calendar no está inicializado."));
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        reject(response);
        return;
      }

      accessToken = response.access_token;
      resolve(response);
    };

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export async function createCalendarEvent({
  title,
  description,
  startDateTime,
  endDateTime,
  timeZone = "America/Bogota",
}) {
  if (!accessToken) {
    throw new Error("No hay access token. Primero autoriza con Google.");
  }

  const event = {
    summary: title,
    description,
    start: {
      dateTime: startDateTime,
      timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone,
    },
  };

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "No se pudo crear el evento.");
  }

  return data;
}