import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
		<main v-if="loading">
            <Spinner></Spinner>
        </main>
		<main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }} ({{ level?.author }})</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier" :date="level.date"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points récolté à la complétion</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Lien du jeu</div>
                            <a :href="level.id" target="_blank" class="type=label-lg">{{ level.author }}</a>
                        </li>
                        <li>
                            <div class="type-title-sm">Durée</div>
                            <p>{{ level.password }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>({{ record.date }})</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.mins }}m {{ record.secs }}sec {{ record.milisecs }}ms</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a>. Edited By <a href="https://www.youtube.com/@Noahpaname_FR">Renoah</a></p>
                        <p></p>
                        <img src="https://media.tenor.com/SOW8irMXPZkAAAAi/catpls-meme.gif" width=128 height=128></img>
                    </div>
                    <template v-if="editors">
                        <h3>Editeurs de liste</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Règles:</h3>
                    <p>
                        Il faut que le jeu (ou le mod) soit téléchargable pour le rendre accessible à tout le monde.
                    </p>
                    <p>
                        Même chose pour la vidéo. Faites qu'elle soit accessible à tous via un lien. (ducoup les vidéos non-repertoriées sont autorisés)
                    </p>
                    <h3>Exigences pour la complétion</h3>
                    <p>
                        La run doit être complète, c'est-à-dire que la run doit commencer au début du challenge jusqu'à l'endscreen.
                    </p>
                    <p>
                        Il ne doit y avoir aucun montage pendant le gameplay.
                    </p>
                    <p>
                        Il est conseillé de spécifier la date de la comlétion dans la description quand la date de publication n'est pas la même. Si ce n'est pas le cas, on prend la date de publication.
                    </p>
                    <p>
                        <u><a href="https://docs.google.com/spreadsheets/d/16T3-m4sDW2ZkzxUt-1J6uiDK5CyGYa0JJD9nk5LRMOA/edit?usp=sharing">Voila la liste des soumissions.</a></u> Et <u><a href="https://docs.google.com/spreadsheets/d/14PLE5AACVWVqCbi2WQwz-_-ZpD4skO2DccxSx3vZRQA/edit?usp=sharing">ici</a></u> les jeux qu'on va ajouter.
                    </p>
                </div>
            </div>
        </main>    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
