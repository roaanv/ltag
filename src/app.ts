export class App {
  async addTag(target: string, tagList: string[], verbose:boolean = false): Promise<void> {
    console.log(`Will tag ${target} with ${tagList} with verbose logging: ${verbose}`);
  }
}

