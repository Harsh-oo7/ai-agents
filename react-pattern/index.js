require('dotenv').config();
const OpenAI = require('openai');
const { Agent } = require('./agent');
const { SYSTEM_PROMPT } = require('./system-prompt');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

function calculate(what) {
    return eval(what);
}

function average_dog_weight(name) {
    if (name.includes("Scottish Terrier")) { 
        return "Scottish Terriers average 20 lbs";
    }
    else if (name.includes("Border Collie")) {
        return "a Border Collies average weight is 37 lbs";
    }
    else if (name.includes("Toy Poodle")) {
        return "a toy poodles average weight is 7 lbs";
    }
    else {
        return "An average dog weights 50 lbs";
    }
}

const known_actions = {
    "calculate": calculate,
    "average_dog_weight": average_dog_weight
};


async function main() {
    

    const question = "I have 2 dogs, a border collie and a scottish terrier. \
                    What is their combined weight";
    
    let i = 0, max_turns = 5;
    const bot = new Agent(openai, SYSTEM_PROMPT);
    let next_prompt = question;
    const action_re = /^Action: (\w+): (.*)$/;
    
    while (i < max_turns) {
        i += 1;
        const result = await bot.call(next_prompt);
        console.log(result);
        
        // Using regex to find actions in the result
        const action_lines = result.split('\n').filter(line => action_re.test(line));
        const actions = action_lines.map(line => action_re.exec(line));
        
        if (actions.length > 0) {
            // There is an action to run
            const [_, action, action_input] = actions[0];
            
            if (!(action in known_actions)) {
                throw new Error(`Unknown action: ${action}: ${action_input}`);
            }
            
            console.log(` -- running ${action} ${action_input}`);
            const observation = known_actions[action](action_input);
            console.log("Observation:", observation);
            next_prompt = `Observation: ${observation}`;
        } else {
            return;
        }
    }
    
}


main();