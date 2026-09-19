FROM elasticsearch:8.17.0

ARG IK_VERSION=8.17.0
ARG IK_ZIP=/tmp/elasticsearch-analysis-ik-${IK_VERSION}.zip

USER root

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl ca-certificates; \
    \
    IK_URLS="\
    https://github.com/infinilabs/analysis-ik/releases/download/v${IK_VERSION}/elasticsearch-analysis-ik-${IK_VERSION}.zip \
    https://release.infinilabs.com/analysis-ik/stable/elasticsearch-analysis-ik-${IK_VERSION}.zip \
    https://registry.npmmirror.com/-/binary/elasticsearch-analysis-ik/v${IK_VERSION}/elasticsearch-analysis-ik-${IK_VERSION}.zip \
    "; \
    \
    INSTALLED=0; \
    for URL in $IK_URLS; do \
    echo "Trying IK download: $URL"; \
    if curl -fSL --retry 3 --retry-delay 2 --insecure \
    -H 'User-Agent: docker-build/1.0' \
    -o "$IK_ZIP" "$URL"; then \
    if [ -s "$IK_ZIP" ]; then \
    echo "Download OK from $URL"; \
    INSTALLED=1; \
    break; \
    fi; \
    fi; \
    rm -f "$IK_ZIP"; \
    echo "  ^ failed, try next mirror"; \
    done; \
    \
    if [ "$INSTALLED" != "1" ]; then \
    echo "ERROR: Failed to download IK plugin from all mirrors."; \
    echo "TIP: If you're in China, set a proxy via --build-arg HTTP_PROXY=..."; \
    exit 1; \
    fi

USER elasticsearch

RUN elasticsearch-plugin install --batch file://${IK_ZIP} && \
    rm -f ${IK_ZIP}
