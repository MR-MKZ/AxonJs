import projectPackage from '../../../package.json';

export function getVersion() {
  return projectPackage.version;
}
