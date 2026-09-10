export const OnlineService = {


    enabled: false,


    async login(
        username,
        password
    ) {


        if (
            !this.enabled
        ) {

            throw new Error(
                "Online service is not configured."
            );

        }


        /*
         * Backend authentication
         * will be implemented here.
         */

        return null;

    },



    async register(
        username,
        password
    ) {


        if (
            !this.enabled
        ) {

            throw new Error(
                "Online service is not configured."
            );

        }


        return null;

    },



    async getLeaderboard() {


        if (
            !this.enabled
        ) {

            return [];

        }


        return [];

    },



    async sendMessage(
        message
    ) {


        if (
            !this.enabled
        ) {

            throw new Error(
                "Online chat is unavailable."
            );

        }


        return null;

    }

};
