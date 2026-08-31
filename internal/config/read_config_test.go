package config_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/kairos-io/AuroraBoot/internal/config"
)

var _ = Describe("ReadConfig --set handling", func() {
	It("applies well-typed --set values to the config and release without error", func() {
		c, r, err := config.ReadConfig("", "", []string{
			"arch=arm64",
			"disable_iso=true",
			"disk.gce=true",
			"disk.size=2000",
			"container_image=oci://example/img:tag",
		})
		Expect(err).NotTo(HaveOccurred())
		Expect(c.Arch).To(Equal("arm64"))
		Expect(c.DisableISOboot).To(BeTrue())
		Expect(c.Disk.GCE).To(BeTrue())
		Expect(c.Disk.Size).To(Equal("2000"))
		Expect(r.ContainerImage).To(Equal("oci://example/img:tag"))
	})

	It("surfaces an error for a --set value that does not fit its field's type", func() {
		// A non-boolean into a boolean field used to be silently dropped (the
		// field kept its zero value, no error reported). It must now surface, so a
		// typo in --set is not swallowed.
		_, _, err := config.ReadConfig("", "", []string{"disable_iso=notabool"})
		Expect(err).To(HaveOccurred())
		Expect(err.Error()).To(ContainSubstring("--set"))
	})

	It("accepts an empty option set", func() {
		c, r, err := config.ReadConfig("", "", nil)
		Expect(err).NotTo(HaveOccurred())
		Expect(c).NotTo(BeNil())
		Expect(r).NotTo(BeNil())
	})
})
