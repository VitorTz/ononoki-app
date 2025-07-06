

export const AppConstants = {
    MangaCoverDimension: {
        width: 300,
        height: 420
    },
    hitSlop: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
    },
    hitSlopLarge: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    },
    READING_STATUS: [
        'Completed',
        'Reading',
        'On Hold',
        'Dropped',
        'Plan to Read',
        'Re-Reading',
        'None'
    ],
    RANDOM_COLORS: [
        "#FFFEE0",
        "#FAF8F6",
        "#FFF8D5",
        "#D5F6FB",
        "#F6F3A9",
        "#E5ECF8",
        "#F0EBD8",
        "#D1FEB8",
        "#EFDFD8",
        "#BEDDF1",
        "#B0E9D5",
        "#DAD4B6",
        "#B4D9EF",
        "#A5E3E0",
        "#F6C1B2",
        "#E9C9AA",
        "#E7D27C",
        "#F6B8D0",
        "#F8C57C",
        "#D7CAB7",
        "#AEC6CF",
        "#FFA4A9",
        "#AFC0EA",
        "#FFB347",
        "#9ECB91",
        "#6ECDDB",
        "#ED8698",
        "#D69759",
        "#FFDADA",
        "#FFFDC7"
    ],
    DARK_COLOR_THRESHOLD: 60,
    BLURHASH: '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[',
    READING_STATUS_ORDER: ["Reading", "Completed", "Dropped", "None", "On Hold", "Plan to Read", "Re-Reading"],
    READING_STATUS_COLOR: new Map([
        ["Completed", "#2D4276"], 
        ["Reading", "#338543"], 
        ["Dropped", "#832F30"], 
        ["None", "#ED65A4"], 
        ["On Hold", "#C9A31F"], 
        ["Plan to Read", "#747474"], 
        ["Re-Reading", "#F8BCCD"]
    ]),
    MAL_PROFILE_URL: "https://myanimelist.net/profile/",
    MAL_USERNAME_MIN_LENGTH: 2,
    MAL_USERNAME_MAX_LENGTH: 16,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 64,
    BIO_MAX_LENGTH: 4096,
    PASSWORD_MIN_LENGTH: 8,
    COMMENT_MIN_LENGTH: 2,
    COMMENT_MAX_LENGTH: 1024
}