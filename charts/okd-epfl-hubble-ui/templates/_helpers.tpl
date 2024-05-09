{{/*
Expand the name of the chart.
*/}}
{{- define ".name" -}}
{{- default (default .Chart.Name .Release.Name) .Values.plugin.name | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define ".chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define ".labels" -}}
helm.sh/chart: {{ include ".chart" . }}
{{ include ".selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define ".selectorLabels" -}}
app: {{ include ".name" . }}
app.kubernetes.io/name: {{ include ".name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ include ".name" . }}
{{- end }}

{{/*
Create the name secret containing the certificate
*/}}
{{- define ".certificateSecret" -}}
{{ default (printf "%s-cert" (include ".name" .)) .Values.plugin.certificateSecretName }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define ".serviceAccountName" -}}
{{- if .Values.plugin.serviceAccount.create }}
{{- default (include ".name" .) .Values.plugin.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the patcher
*/}}
{{- define ".patcherName" -}}
{{- printf "%s-patcher" (include ".name" .) }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define ".patcherServiceAccountName" -}}
{{- if .Values.plugin.patcherServiceAccount.create }}
{{- default (printf "%s-patcher" (include ".name" .)) .Values.plugin.patcherServiceAccount.name }}
{{- else }}
{{- default "default" .Values.plugin.patcherServiceAccount.name }}
{{- end }}
{{- end }}

{{/*
The hostname where the token reflector lives
*/}}
{{- define ".tokenReflectorHostname" -}}
{{- .Values.hubbleAPI.tokenReflector.hostname | default (regexReplaceAll "^[^.]+" .Values.hubbleUI.hostname "console-openshift-console") }}
{{- end }}

