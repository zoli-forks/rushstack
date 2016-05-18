/**
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */

import * as os from 'os';
import * as colors from 'colors';
import * as wordwrap from 'wordwrap';

import { CommandLineFlagParameter } from '../commandLine/CommandLineParameter';
import CommandLineParser from '../commandLine/CommandLineParser';
import RushConfig from '../data/RushConfig';
import InstallAction from './InstallAction';
import LinkAction from './LinkAction';
import RebuildAction from './RebuildAction';
import GenerateAction from './GenerateAction';
import CheckAction from './CheckAction';
import Utilities from '../utilities/Utilities';

export default class RushCommandLineParser extends CommandLineParser {
  public rushConfig: RushConfig;
  private _debugParameter: CommandLineFlagParameter;

  constructor() {
    super({
      toolFilename: 'rush',
      toolDescription: 'Rush helps you to manage a collection of Node Package Manager'
      + ' projects.  (For more details about NPM, see the www.npmjs.com web site.)'
      + ' Rush collects the dependencies for all projects into a "common" folder,'
      + ' detects which projects can be locally linked, and then performs a fast parallel'
      + ' build according to the detected dependency graph.  If you want to decompose'
      + ' your monolithic project into many small packages but are afraid of the dreaded'
      + ' NPM progress bar, Rush is for you.'
    });

    this.addAction(new GenerateAction(this));
    this.addAction(new InstallAction(this));
    this.addAction(new LinkAction(this));
    this.addAction(new RebuildAction(this));
    this.addAction(new CheckAction(this));
  }

  protected onDefineParameters(): void {
    this._debugParameter = this.defineFlagParameter({
      parameterLongName: '--debug',
      parameterShortName: '-d',
      description: 'Show the full call stack if an error occurs while executing the tool'
    });
  }

  protected onExecute(): void {
    this.trapErrors(() => {
      super.onExecute();
    });
  }

  public trapErrors(action: () => void): void {
    if (this._debugParameter.value) {
      action();
    } else {
      try {
        action();
      } catch (error) {

        const prefix: string = 'ERROR: ';
        const wrap: (textToWrap: string) => string = wordwrap.soft(prefix.length, Utilities.getConsoleWidth());
        console.error(os.EOL + colors.red(prefix + wrap(error.message).trim()));
        process.exit(1);
      }
    }
  }

}
