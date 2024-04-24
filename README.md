# Hubble UI as an OpenShift console plug-in

[Dynamic plugins](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
allow you to extend the
[OpenShift UI](https://github.com/openshift/console)
at runtime, adding custom pages and other extensions. They are based on
[webpack module federation](https://webpack.js.org/concepts/module-federation/).
Plugins are registered with console using the `ConsolePlugin` custom resource
and enabled in the console operator config by a cluster administrator.

Using the latest `v1` API version of `ConsolePlugin` CRD, requires OpenShift 4.12
and higher. For using old `v1alpha1` API version us OpenShift version 4.10 or 4.11.

For an example of a plugin that works with OpenShift 4.11, see the `release-4.11` branch.
For a plugin that works with OpenShift 4.10, see the `release-4.10` branch.

[Node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com) are required
to build and run the example. To run OpenShift console in a container, either
[Docker](https://www.docker.com) or [podman 3.2.0+](https://podman.io) and
[oc](https://console.redhat.com/openshift/downloads) are required.

## Development

### Option 1: Local

In one terminal window, run:

1. `yarn install`
2. `yarn run start`

In another terminal window, run:

1. `oc login` (requires [oc](https://console.redhat.com/openshift/downloads) and an [OpenShift cluster](https://console.redhat.com/openshift/create))
2. `yarn build-dev`
3. Run `npm_package_consolePlugin_name=okd-epfl-hubble-ui yarn run start-console` (requires [Docker](https://www.docker.com) or [podman 3.2.0+](https://podman.io))

This will run the OpenShift console in a container connected to the cluster
you've logged into. The plugin HTTP server runs on port 9001 with CORS enabled.
Navigate to <http://localhost:9000/example> to see the running plugin.

#### Running start-console with Apple silicon and podman

If you are using podman on a Mac with Apple silicon, `yarn run start-console`
might fail since it runs an amd64 image. You can workaround the problem with
[qemu-user-static](https://github.com/multiarch/qemu-user-static) by running
these commands:

```bash
podman machine ssh
sudo -i
rpm-ostree install qemu-user-static
systemctl reboot
```

### Option 2: Docker + VSCode Remote Container

Make sure the
[Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension is installed. This method uses Docker Compose where one container is
the OpenShift console and the second container is the plugin. It requires that
you have access to an existing OpenShift cluster. After the initial build, the
cached containers will help you start developing in seconds.

1. Create a `dev.env` file inside the `.devcontainer` folder with the correct values for your cluster:

```bash
OC_PLUGIN_NAME=console-plugin-template
OC_URL=https://api.example.com:6443
OC_USER=kubeadmin
OC_PASS=<password>
```

2. `(Ctrl+Shift+P) => Remote Containers: Open Folder in Container...`
3. `yarn run start`
4. Navigate to <http://localhost:9000/example>

## Deployment on cluster

A [Helm](https://helm.sh) chart is available to deploy the plugin to an OpenShift environment.

The following Helm parameters are required:

- `plugin.image`<br/> The location of the image containing the plugin that was previously pushed
- `hubbleAPI.accessList`<br/> The list of authenticated users who may access the Hubble API, as a `ClusterRoleBinding`-style `subject:` list
- `hubbleAPI.hostname`<br/> The host name for the route at which the Hubble API will be accessible (in an iframe embedded within the right panel that the OpenShift console plugin renders)

For instance:

```bash
helm upgrade okd-epfl-hubble-ui charts/okd-epfl-hubble-ui \
  --namespace cilium --set "plugin.image=si-quay.epfl.ch/cilium-public/okd.epfl-hubble-ui=0.1.2" \
  --set "hubbleAPI.accessList[0].apiGroup=rbac.authorization.k8s.io" \
  --set "hubbleAPI.accessList[0].kind=User" \
  --set "hubbleAPI.accessList[0].name=$(whoami)" \
  --set "hubbleAPI.hostname=hubble-ui.apps.fsd.ocp-test.epfl.ch"
```

Additional parameters can be specified if desired. Consult the chart [values](charts/openshift-console-plugin/values.yaml) file for the full set of supported parameters.

## Building and Installing using the configuration-as-code

This project is managed as part of (the `cilium` branch of) https://github.com/epfl-si/sddc-ocp . In order to load it “properly” from there, the steps are as follows:

1. **Make a new tagged release here**, e.g.
   1. Bump the version fields in `package.json` (⚠ two places) and `charts/okd-epfl-hubble-ui/Chart.yaml`
   2. Commit, tag and push these changes:
      ```bash
      git commit -m "[chore] Version 0.1.2345" package.json charts/okd-epfl-hubble-ui/Chart.yaml
      git tag v0.1.2345
      git push
      git push --tags
      ```
   3. Wait a bit for the [GitHub action](https://github.com/epfl-si/cluster.okd.hubble-ui/blob/main/.github/workflows/release.yml) to do its job.
2. **Sync the version in the configuration-as-code**: in your checked out revision [epfl-si/sddc-ocp](https://github.com/epfl-si/sddc-ocp), edit `vars/versions.yml` and update `cilium_hubble_ui_epfl_version`
3. **Build the new image in the hub cluster**: for instance,
   ```bash
   ./xaasible -t openshift.cilium.hubble.build
   ```
4. **Deploy in a canary cluster**: for instance,
   ```bash
   ./xaasible -l fsd.ocp-test.epfl.ch -t openshift.cilium.hubble.run  -vvv
   ```

## References

- [Console Plugin SDK README](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [Customization Plugin Example](https://github.com/spadgett/console-customization-plugin)
- [Dynamic Plugin Enhancement Proposal](https://github.com/openshift/enhancements/blob/master/enhancements/console/dynamic-plugins.md)
