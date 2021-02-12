// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { codeExport as exporter } from '@seleniumhq/side-utils'
import { Command, location } from '@seleniumhq/code-export-csharp-commons'
const emitters = { ...Command.emitters }

exporter.register.preprocessors(emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters: emitters })
}

function emit(command) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup: Command.variableLookup,
    emitNewWindowHandling: Command.extras.emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!emitters[commandName]
}

emitters.assert = emitAssert
emitters.verify = emitAssert

function emitAssert(varName, value) {
  return Promise.resolve(
    `Assert.Equal($"${value}".ToLower(), Vars["${varName}"].ToString()?.ToLower());`
  )
}

emitters.assertAlert = emitAssertAlert
emitters.assertConfirmation = emitAssertAlert
emitters.assertPrompt = emitAssertAlert

function emitAssertAlert(AlertText) {
  return Promise.resolve(
    `Assert.Equal(Driver.SwitchTo().Alert().Text, $"${AlertText}");`
  )
}

emitters.assertChecked = emitVerifyChecked
emitters.verifyChecked = emitVerifyChecked

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `Assert.True(Driver.FindElement(${await location.emit(locator)}).Selected);`
  )
}

emitters.assertEditable = emitVerifyEditable
emitters.verifyEditable = emitVerifyEditable

async function emitVerifyEditable(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.Enabled && element.GetAttribute("readonly") == null;',
    },
    { level: 1, statement: 'Assert.True(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.assertElementPresent = emitAssertElementPresent

async function emitAssertElementPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `IReadOnlyCollection<IWebElement> elements = Driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Assert.True(elements.Count > 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.verifyElementPresent = emitVerifyElementPresent

async function emitVerifyElementPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `IReadOnlyCollection<IWebElement> elements = Driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: `if (elements.Count < 1) Console.WriteLine("${locator} not presents!");` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.assertElementNotPresent = emitAssertElementNotPresent

async function emitAssertElementNotPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `IReadOnlyCollection<IWebElement> elements = Driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Assert.True(elements.Count == 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.verifyElementNotPresent = emitVerifyElementNotPresent

async function emitVerifyElementNotPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `IReadOnlyCollection<IWebElement> elements = Driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: `if (elements.Count > 0) Console.WriteLine("${locator} presents!");` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.assertNotChecked = emitVerifyNotChecked
emitters.verifyNotChecked = emitVerifyNotChecked

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `Assert.False(Driver.FindElement(${await location.emit(
      locator
    )}).Selected);`
  )
}

emitters.assertNotEditable = emitVerifyNotEditable
emitters.verifyNotEdtiable = emitVerifyNotEditable

async function emitVerifyNotEditable(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.Enabled && element.GetAttribute("readonly") == null;',
    },
    { level: 1, statement: 'Assert.False(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.assertNotSelectedValue = emitVerifyNotSelectedValue
emitters.verifyNotSelectedValue = emitVerifyNotSelectedValue

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = Driver.FindElement(${await location.emit(
        locator
      )}).GetAttribute("value");`,
    },
    {
      level: 1,
      statement: `Assert.NotEqual($"${expectedValue}", value);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.assertNotText = emitVerifyNotText
emitters.verifyNotText = emitVerifyNotText

async function emitVerifyNotText(locator, text) {
  const result = `Driver.FindElement(${await location.emit(locator)}).Text`
  return Promise.resolve(
    `Assert.NotEqual($"${text}", ${result});`
  )
}

emitters.assertSelectedLabel = emitVerifySelectedLabel
emitters.verifySelectedLabel = emitVerifySelectedLabel

async function emitVerifySelectedLabel(locator, labelValue) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'String value = element.GetAttribute("value");' },
    {
      level: 1,
      statement: `String locator = String.Format("option[@value='%s']", "value");`,
    },
    {
      level: 1,
      statement:
        'String selectedText = element.FindElement(By.XPath(locator)).Text;',
    },
    {
      level: 1,
      statement: `Assert.Equal(selectedText, $"${labelValue}");`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

emitters.assertSelectedValue = emitVerifyValue
emitters.verifySelectedValue = emitVerifyValue
emitters.assertValue = emitVerifyValue

async function emitVerifyValue(locator, value) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = Driver.FindElement(${await location.emit(
        locator
      )}).GetAttribute("value");`,
    },
    { level: 1, statement: `Assert.Equal($"${value}", value);` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

emitters.assertText = emitVerifyText
emitters.verifyText = emitVerifyText

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `Assert.Equal($"${text}", Driver.FindElement(${await location.emit(
      locator
    )}).Text);`
  )
}

emitters.assertTitle = emitVerifyTitle
emitters.verifyTitle = emitVerifyTitle

async function emitVerifyTitle(title) {
  return Promise.resolve(`Assert.Equal(Driver.Title, $"${title}");`)
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow: Command.extras.emitWaitForWindow },
}
