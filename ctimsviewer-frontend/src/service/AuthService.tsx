import axios from 'axios';
import qs from 'qs';

// keycloak config
const constants = {
    // API
    API_GATEWAY: '',
    API_AUTH: '',
    API_TOKEN: '',

    // OAuth2
    OAUTH2_REALM: '',
    OAUTH2_CLIENT_ID: '',
    OAUTH2_CLIENT_SECRET: '',
    OAUTH2_GRANT_TYPE: {
        PASSWORD: 'password',
        REFRESH_TOKEN: 'refresh_token'
    },

    // Local storage keys
    KEY_ACCESS_TOKEN: 'access_token',
    KEY_REFRESH_TOKEN: 'refresh_token',
    KEY_EXPIRES_IN: 'expires_in',
    KEY_LOGGED_BEFORE: 'logged_before'
}

export function logout() {
    window.localStorage.removeItem(constants.KEY_ACCESS_TOKEN)
    window.localStorage.removeItem(constants.KEY_REFRESH_TOKEN)
    window.localStorage.removeItem(constants.KEY_EXPIRES_IN)
}

export function authenticate(accessToken: string, refreshToken: string) {
    if (!accessToken || !refreshToken) {
        console.warn(`Got bad token while logging in.\nAccess Token: ${accessToken}.\nRefresh Token: ${refreshToken}`)
    }

    let loggedBefore = (new Date().getTime() + 60 * 60 * 1000).toString();

    window.localStorage.setItem(constants.KEY_ACCESS_TOKEN, accessToken)
    window.localStorage.setItem(constants.KEY_LOGGED_BEFORE, loggedBefore)
    window.localStorage.setItem(constants.KEY_REFRESH_TOKEN, refreshToken)

    return true;
}

export async function login(username: any, password: any) {
    const data = qs.stringify({
        'grant_type': "password",
        'client_id': process.env.REACT_APP_KEYCLOAK_CLIENT ,
        'client_secret': "ZGCR2WTstLIZWrkW4j59vAKiai7hs6Nh",
        'username': username,
        'password': password
    });

    const config = {
        method: 'post',
        url: "http://localhost:4000/realms/Ctimsorg/protocol/openid-connect/token",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data : data
    };

    await axios(config)
        .then(function (resp) {
            console.log(resp.data);
            let accessToken = 'access_token' in resp.data ? resp.data.access_token : null
            let refreshToken = 'refresh_token' in resp.data ? resp.data.refresh_token : null
            console.log('Access Token', accessToken);
            //authenticate(accessToken, refreshToken)

        })
        .catch(function () {
            console.log('Invalid credentials for authentication.');
        });
}

export async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (refreshToken === null) {
        return null;
    }

    const data = qs.stringify({
        'client_id': constants.OAUTH2_CLIENT_ID,
        'client_secret': constants.OAUTH2_CLIENT_SECRET,
        'grant_type': constants.OAUTH2_GRANT_TYPE.REFRESH_TOKEN,
        'refresh_token': getRefreshToken()
    });

    const config = {
        method: 'post',
        url: constants.API_TOKEN,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data : data
    };

    axios(config)
        .then(function (response) {
            if (response.status === 200) {
                console.log(response.data);
                console.log('SYSTEM: Access token was taken, system are trying to login with the access token...')
                let accessToken = 'access_token' in response.data ? response.data.access_token : null
                authenticate(accessToken, refreshToken);
                
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

export function getRefreshToken() {
    return window.localStorage.getItem(constants.KEY_REFRESH_TOKEN)
}

export async function getAccessToken() {
    const loggedBefore = window.localStorage.getItem(constants.KEY_LOGGED_BEFORE)
    const accessToken = window.localStorage.getItem(constants.KEY_ACCESS_TOKEN)

    if (!accessToken) {
        await refreshAccessToken();
    }

    if (accessToken && loggedBefore && (loggedBefore <= new Date().getTime().toString())) {
        console.log('SYSTEM: Access token expired, system are trying to refresh the access token...')
        return await refreshAccessToken();
    }
    return accessToken;
}

export function isAuthenticated() {
    console.log(!!getRefreshToken())
    return !!getRefreshToken();
}
