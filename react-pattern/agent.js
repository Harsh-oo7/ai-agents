class Agent {
    constructor(client, system = '') {
        if(!client) throw Error("AI Client is required");

        this.system = system;
        this.messages = [];
        if(this.system) {
            this.messages.push({
                "role": "system",
                "content": this.system
            })
        }
        this.client = client
    }

    async call(message) {
        this.messages.push({
            "role": "user",
            "content": message
        });
        this.result = await this.execute();
        this.messages.push({
            "role": "assistant",
            "content": this.result
        });
        return this.result;
    }

    async execute() {
        this.completion = await this.client.chat.completions.create({
            model: "gpt-4o",
            temperature: 0,
            messages: this.messages
        });
        return this.completion.choices[0].message.content;
    }
}

module.exports = {
    Agent
}